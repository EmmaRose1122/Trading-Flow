package com.tradingflow.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String PREFS_NAME = "trading_flow";
    private static final String SERVER_URL_KEY = "server_url";

    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private TextView errorMessage;
    private SharedPreferences preferences;
    private String appUrl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.parseColor("#B91C1C"));
        getWindow().setNavigationBarColor(Color.parseColor("#B91C1C"));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            getWindow().getDecorView().setSystemUiVisibility(0);
        }

        preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        appUrl = preferences.getString(SERVER_URL_KEY, getString(R.string.app_url));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#FFFFFF"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#FFFFFF"));
        configureWebView();
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(3),
                Gravity.TOP
        );
        root.addView(progressBar, progressParams);

        errorView = buildErrorView();
        FrameLayout.LayoutParams errorParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
        );
        errorParams.setMargins(dp(28), dp(28), dp(28), dp(28));
        root.addView(errorView, errorParams);

        setContentView(root);
        loadApp();
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setUserAgentString(settings.getUserAgentString() + " TradingFlowAndroid/1.0");

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, false);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUri(request.getUrl());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showError(getString(R.string.connection_error));
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, android.webkit.WebResourceResponse errorResponse) {
                if (request.isForMainFrame() && errorResponse.getStatusCode() >= 400) {
                    showError(getString(R.string.server_error));
                }
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
                openExternally(Uri.parse(url))
        );
    }

    private LinearLayout buildErrorView() {
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setGravity(Gravity.CENTER_HORIZONTAL);
        container.setPadding(dp(24), dp(28), dp(24), dp(28));
        container.setBackgroundColor(Color.parseColor("#FFFFFF"));
        container.setVisibility(View.GONE);

        TextView title = new TextView(this);
        title.setText(R.string.connection_title);
        title.setTextColor(Color.parseColor("#2B0B0E"));
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
        title.setGravity(Gravity.CENTER);

        errorMessage = new TextView(this);
        errorMessage.setTextColor(Color.parseColor("#7A5A5D"));
        errorMessage.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        errorMessage.setGravity(Gravity.CENTER);
        errorMessage.setPadding(0, dp(10), 0, dp(22));

        Button retryButton = new Button(this);
        retryButton.setText(R.string.retry);
        retryButton.setAllCaps(false);
        retryButton.setBackgroundColor(Color.parseColor("#DC2626"));
        retryButton.setTextColor(Color.WHITE);
        retryButton.setOnClickListener(view -> loadApp());

        Button serverButton = new Button(this);
        serverButton.setText(R.string.change_server);
        serverButton.setAllCaps(false);
        serverButton.setOnClickListener(view -> promptForServerUrl());

        LinearLayout buttonRow = new LinearLayout(this);
        buttonRow.setOrientation(LinearLayout.HORIZONTAL);
        buttonRow.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(0, dp(48), 1);
        buttonParams.setMargins(dp(4), 0, dp(4), 0);
        buttonRow.addView(retryButton, buttonParams);
        buttonRow.addView(serverButton, buttonParams);

        container.addView(title);
        container.addView(errorMessage);
        container.addView(buttonRow, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        return container;
    }

    private void loadApp() {
        if (!isValidServerUrl(appUrl)) {
            showError(getString(R.string.invalid_server_url));
            promptForServerUrl();
            return;
        }
        errorView.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.VISIBLE);
        webView.loadUrl(appUrl);
    }

    private void showError(String message) {
        progressBar.setVisibility(View.GONE);
        webView.setVisibility(View.GONE);
        errorMessage.setText(message);
        errorView.setVisibility(View.VISIBLE);
    }

    private boolean handleUri(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
        if (!scheme.equals("http") && !scheme.equals("https")) {
            return openExternally(uri);
        }

        String appHost = Uri.parse(appUrl).getHost();
        boolean sameHost = appHost != null && appHost.equalsIgnoreCase(uri.getHost());
        boolean isDownload = uri.getLastPathSegment() != null
                && uri.getLastPathSegment().toLowerCase().endsWith(".apk");

        if (!sameHost || isDownload) {
            return openExternally(uri);
        }
        return false;
    }

    private boolean openExternally(Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            Toast.makeText(this, R.string.no_app_to_open_link, Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private void promptForServerUrl() {
        EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        input.setSingleLine(true);
        input.setText(appUrl);
        input.setSelectAllOnFocus(true);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle(R.string.server_address)
                .setMessage(R.string.server_address_hint)
                .setView(input)
                .setPositiveButton(R.string.save_and_retry, null)
                .setNegativeButton(R.string.cancel, null)
                .create();

        dialog.setOnShowListener(ignored -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(view -> {
            String normalized = normalizeServerUrl(input.getText().toString());
            if (!isValidServerUrl(normalized)) {
                input.setError(getString(R.string.invalid_server_url));
                return;
            }
            appUrl = normalized;
            preferences.edit().putString(SERVER_URL_KEY, normalized).apply();
            dialog.dismiss();
            loadApp();
        }));
        dialog.show();
    }

    private String normalizeServerUrl(String value) {
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return trimmed;
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://" + trimmed;
        }
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private boolean isValidServerUrl(String value) {
        try {
            Uri uri = Uri.parse(value);
            return uri.getHost() != null && uri.getScheme().equals("https");
        } catch (Exception ignored) {
            return false;
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onBackPressed() {
        if (errorView.getVisibility() == View.VISIBLE || !webView.canGoBack()) {
            super.onBackPressed();
            return;
        }
        webView.goBack();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
