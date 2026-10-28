#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_SRC="$ROOT/android-webview"
BUILD_DIR="$ROOT/.apk-build"
OUTPUT_DIR="$ROOT/public/downloads"
APP_URL="${APP_URL:-https://trading-flow.vercel.app}"
VERSION_NAME="${VERSION_NAME:-1.0.0}"
VERSION_CODE="${VERSION_CODE:-$(date +%y%m%d%H)}"

if [ -z "${JAVA_HOME:-}" ] && command -v javac >/dev/null 2>&1; then
  JAVA_HOME="$(dirname "$(dirname "$(command -v javac)")")"
fi
if [ -z "${JAVA_HOME:-}" ] || { [ ! -x "$JAVA_HOME/bin/javac" ] && [ ! -f "$JAVA_HOME/bin/javac.exe" ]; }; then
  echo "JAVA_HOME must point to a JDK 17 installation." >&2
  exit 1
fi
JAVA_BIN="$JAVA_HOME/bin"
if [ -f "$JAVA_BIN/java.exe" ]; then
  JAVA="$JAVA_BIN/java.exe"
  JAVAC="$JAVA_BIN/javac.exe"
  JAR="$JAVA_BIN/jar.exe"
  KEYTOOL="$JAVA_BIN/keytool.exe"
else
  JAVA="$JAVA_BIN/java"
  JAVAC="$JAVA_BIN/javac"
  JAR="$JAVA_BIN/jar"
  KEYTOOL="$JAVA_BIN/keytool"
fi

SDK_ROOT="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-${LOCALAPPDATA:-$HOME}/Android/Sdk}}"
if [ ! -d "$SDK_ROOT" ]; then
  echo "Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT." >&2
  exit 1
fi

PLATFORM_DIR="$(find "$SDK_ROOT/platforms" -mindepth 1 -maxdepth 1 -type d -name 'android-*' | sort -V | tail -1)"
if [ -z "$PLATFORM_DIR" ] || [ ! -f "$PLATFORM_DIR/android.jar" ]; then
  echo "An Android platform with android.jar is required." >&2
  exit 1
fi

if [ -n "${BUILD_TOOLS_VERSION:-}" ]; then
  BUILD_TOOLS_DIR="$SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION"
else
  BUILD_TOOLS_DIR="$(find "$SDK_ROOT/build-tools" -mindepth 1 -maxdepth 1 -type d | sort -V | tail -1)"
fi
if [ ! -f "$BUILD_TOOLS_DIR/aapt2.exe" ] && [ ! -x "$BUILD_TOOLS_DIR/aapt2" ]; then
  echo "Android build-tools are required." >&2
  exit 1
fi
if [ -f "$BUILD_TOOLS_DIR/aapt2.exe" ]; then
  AAPT2="$BUILD_TOOLS_DIR/aapt2.exe"
  ZIPALIGN="$BUILD_TOOLS_DIR/zipalign.exe"
else
  AAPT2="$BUILD_TOOLS_DIR/aapt2"
  ZIPALIGN="$BUILD_TOOLS_DIR/zipalign"
fi
D8_JAR="$BUILD_TOOLS_DIR/lib/d8.jar"
APKSIGNER_JAR="$BUILD_TOOLS_DIR/lib/apksigner.jar"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/res" "$BUILD_DIR/gen" "$BUILD_DIR/classes" "$BUILD_DIR/dex" "$OUTPUT_DIR"
cp -R "$ANDROID_SRC/res/." "$BUILD_DIR/res/"
cp "$ANDROID_SRC/AndroidManifest.xml" "$BUILD_DIR/AndroidManifest.xml"

node - "$APP_URL" "$BUILD_DIR/res/values/strings.xml" <<'NODE'
const fs = require("fs");
const [appUrl, stringsPath] = process.argv.slice(2);
const escaped = appUrl.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const source = fs.readFileSync(stringsPath, "utf8");
fs.writeFileSync(
  stringsPath,
  source.replace(/(<string name="app_url">)[^<]*(<\/string>)/, `$1${escaped}$2`),
  "utf8"
);
NODE

"$AAPT2" compile --dir "$BUILD_DIR/res" -o "$BUILD_DIR/resources.zip"
"$AAPT2" link \
  -o "$BUILD_DIR/unsigned.apk" \
  -I "$PLATFORM_DIR/android.jar" \
  --manifest "$BUILD_DIR/AndroidManifest.xml" \
  -R "$BUILD_DIR/resources.zip" \
  --auto-add-overlay \
  --java "$BUILD_DIR/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 36 \
  --version-code "$VERSION_CODE" \
  --version-name "$VERSION_NAME"

find "$ANDROID_SRC/src" "$BUILD_DIR/gen" -name '*.java' -print0 \
  | xargs -0 "$JAVAC" -encoding UTF-8 -source 8 -target 8 -classpath "$PLATFORM_DIR/android.jar" -d "$BUILD_DIR/classes"

find "$BUILD_DIR/classes" -name '*.class' -print0 \
  | xargs -0 "$JAVA" -cp "$D8_JAR" com.android.tools.r8.D8 \
      --lib "$PLATFORM_DIR/android.jar" \
      --min-api 24 \
      --output "$BUILD_DIR/dex"

"$JAR" ufM "$BUILD_DIR/unsigned.apk" -C "$BUILD_DIR/dex" classes.dex
"$ZIPALIGN" -f -p 4 "$BUILD_DIR/unsigned.apk" "$BUILD_DIR/aligned.apk"

KEYSTORE="${ANDROID_KEYSTORE:-$HOME/.android/debug.keystore}"
KEY_ALIAS="${ANDROID_KEY_ALIAS:-androiddebugkey}"
STORE_PASSWORD="${ANDROID_KEYSTORE_PASSWORD:-android}"
if [ ! -f "$KEYSTORE" ]; then
  mkdir -p "$(dirname "$KEYSTORE")"
  "$KEYTOOL" -genkeypair -v \
    -keystore "$KEYSTORE" \
    -storepass "$STORE_PASSWORD" \
    -alias "$KEY_ALIAS" \
    -keypass "$STORE_PASSWORD" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US"
fi

"$JAVA" -jar "$APKSIGNER_JAR" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias "$KEY_ALIAS" \
  --ks-pass "pass:$STORE_PASSWORD" \
  --key-pass "pass:$STORE_PASSWORD" \
  --out "$OUTPUT_DIR/trading-flow.apk" \
  "$BUILD_DIR/aligned.apk"

"$JAVA" -jar "$APKSIGNER_JAR" verify --verbose "$OUTPUT_DIR/trading-flow.apk" >/dev/null
rm -f "$OUTPUT_DIR/trading-flow.apk.idsig"

SHA256="$(sha256sum "$OUTPUT_DIR/trading-flow.apk" | awk '{print $1}')"
SIZE="$(wc -c < "$OUTPUT_DIR/trading-flow.apk" | tr -d ' ')"
CREATED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cat > "$OUTPUT_DIR/app-version.json" <<EOF
{
  "versionName": "$VERSION_NAME",
  "versionCode": $VERSION_CODE,
  "apkUrl": "/downloads/trading-flow.apk",
  "sha256": "$SHA256",
  "sizeBytes": $SIZE,
  "publishedAt": "$CREATED_AT",
  "serverUrl": "$APP_URL"
}
EOF

echo "APK built: $OUTPUT_DIR/trading-flow.apk"
echo "Version: $VERSION_NAME ($VERSION_CODE)"
echo "Server URL: $APP_URL"
echo "SHA-256: $SHA256"
