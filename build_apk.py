import os
import subprocess
import shutil
import zipfile

def build():
    sdk = r"C:\Users\user\AppData\Local\Android\Sdk"
    bt = os.path.join(sdk, "build-tools", "35.0.0")
    android_jar = os.path.join(sdk, "platforms", "android-35", "android.jar")
    jdk_bin = r"C:\Program Files\Java\jdk-17\bin"
    javac = os.path.join(jdk_bin, "javac.exe")
    keytool = os.path.join(jdk_bin, "keytool.exe")
    aapt2 = os.path.join(bt, "aapt2.exe")
    d8 = os.path.join(bt, "d8.bat")
    zipalign = os.path.join(bt, "zipalign.exe")
    apksigner = os.path.join(bt, "apksigner.bat")

    work_dir = r"d:\antigravity\apk_build_tmp"
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir, ignore_errors=True)
    os.makedirs(work_dir, exist_ok=True)

    src_dir = os.path.join(work_dir, "src", "com", "progamer", "road")
    res_dir = os.path.join(work_dir, "res")
    values_dir = os.path.join(res_dir, "values")
    mipmap_dir = os.path.join(res_dir, "mipmap")
    assets_dir = os.path.join(work_dir, "assets")
    gen_dir = os.path.join(work_dir, "gen")
    bin_dir = os.path.join(work_dir, "bin")

    os.makedirs(src_dir, exist_ok=True)
    os.makedirs(values_dir, exist_ok=True)
    os.makedirs(mipmap_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(gen_dir, exist_ok=True)
    os.makedirs(bin_dir, exist_ok=True)

    # 1. AndroidManifest.xml
    manifest_path = os.path.join(work_dir, "AndroidManifest.xml")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.progamer.road"
    android:versionCode="4"
    android:versionName="1.8.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="35" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="로드 투 월즈"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>''')

    # 2. strings.xml
    with open(os.path.join(values_dir, "strings.xml"), "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">로드 투 월즈</string>
</resources>''')

    # 3. Create app icon (ic_launcher.png)
    from PIL import Image
    src_icon_path = r"d:\antigravity\pro-gamer\icon-512.png"
    if os.path.exists(src_icon_path):
        base_icon = Image.open(src_icon_path)
    else:
        from PIL import ImageDraw
        base_icon = Image.new("RGBA", (512, 512), (14, 18, 32, 255))
        d = ImageDraw.Draw(base_icon)
        d.ellipse([16, 16, 496, 496], fill=(30, 25, 60, 255), outline=(245, 158, 11, 255), width=16)

    # Save to mipmap
    icon_192 = base_icon.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(mipmap_dir, "ic_launcher.png"))
    icon_192.save(os.path.join(mipmap_dir, "ic_launcher_round.png"))

    # 4. MainActivity.java
    java_file = os.path.join(src_dir, "MainActivity.java")
    with open(java_file, "w", encoding="utf-8") as f:
        f.write('''package com.progamer.road;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
''')

    # 5. Copy web assets into assets/
    shutil.copy(r"d:\antigravity\pro-gamer\index.html", os.path.join(assets_dir, "index.html"))
    shutil.copytree(r"d:\antigravity\pro-gamer\assets", os.path.join(assets_dir, "assets"), dirs_exist_ok=True)
    if os.path.exists(r"d:\antigravity\pro-gamer\champs"):
        shutil.copytree(r"d:\antigravity\pro-gamer\champs", os.path.join(assets_dir, "champs"), dirs_exist_ok=True)
    for img in os.listdir(r"d:\antigravity\pro-gamer\assets"):
        img_p = os.path.join(r"d:\antigravity\pro-gamer\assets", img)
        if os.path.isfile(img_p):
            shutil.copy(img_p, os.path.join(assets_dir, img))

    # 6. AAPT2 Compile
    compiled_res = os.path.join(work_dir, "compiled_res.zip")
    cmd_compile = [aapt2, "compile", "--dir", res_dir, "-o", compiled_res]
    res = subprocess.run(cmd_compile, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"aapt2 compile failed: {res.stderr}")

    # 7. AAPT2 Link
    unaligned_apk = os.path.join(bin_dir, "unaligned.apk")
    cmd_link = [
        aapt2, "link",
        "-I", android_jar,
        "-o", unaligned_apk,
        "--manifest", manifest_path,
        "--java", gen_dir,
        compiled_res,
        "--auto-add-overlay"
    ]
    res = subprocess.run(cmd_link, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"aapt2 link failed: {res.stderr}")

    # 8. Javac
    r_java = os.path.join(gen_dir, "com", "progamer", "road", "R.java")
    cmd_javac = [
        javac,
        "-cp", android_jar,
        "-d", bin_dir,
        "-source", "1.8",
        "-target", "1.8",
        java_file,
        r_java
    ]
    res = subprocess.run(cmd_javac, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"javac failed: {res.stderr}")

    # 9. D8 (DEX Compiler)
    class_files = []
    for root, dirs, files in os.walk(bin_dir):
        for f in files:
            if f.endswith(".class"):
                class_files.append(os.path.join(root, f))

    cmd_d8 = [
        "cmd.exe", "/c", d8,
        "--lib", android_jar,
        "--output", bin_dir
    ] + class_files
    res = subprocess.run(cmd_d8, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"d8 failed: {res.stderr}")

    # 10. Add classes.dex and assets into unaligned.apk
    classes_dex = os.path.join(bin_dir, "classes.dex")
    with zipfile.ZipFile(unaligned_apk, "a") as z:
        z.write(classes_dex, "classes.dex")
        for root, dirs, files in os.walk(assets_dir):
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, work_dir)
                z.write(full_path, rel_path)

    # 11. Zipalign
    aligned_apk = os.path.join(bin_dir, "aligned.apk")
    cmd_align = [zipalign, "-p", "-f", "4", unaligned_apk, aligned_apk]
    res = subprocess.run(cmd_align, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"zipalign failed: {res.stderr}")

    # 12. Release Keystore
    keystore = r"d:\antigravity\pro_road_release.keystore"
    if not os.path.exists(keystore):
        cmd_key = [
            keytool, "-genkeypair", "-v",
            "-keystore", keystore,
            "-storepass", "proroad2026!",
            "-alias", "proroadrelease",
            "-keypass", "proroad2026!",
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-dname", "CN=ProGamer Road,OU=Game Studio,O=ProGamer Inc,L=Seoul,ST=Seoul,C=KR"
        ]
        res = subprocess.run(cmd_key, capture_output=True, text=True)
        if res.returncode != 0:
            raise Exception(f"keytool failed: {res.stderr}")

    # 13. Apksigner with v1, v2, v3 schemes
    final_apk = r"d:\antigravity\pro-gamer\pro-gamer.apk"
    cmd_sign = [
        "cmd.exe", "/c", apksigner, "sign",
        "--ks", keystore,
        "--ks-pass", "pass:proroad2026!",
        "--ks-key-alias", "proroadrelease",
        "--key-pass", "pass:proroad2026!",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        "--out", final_apk,
        aligned_apk
    ]
    res = subprocess.run(cmd_sign, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"apksigner failed: {res.stderr}")

    try:
        shutil.rmtree(work_dir, ignore_errors=True)
    except:
        pass

    # Copy to zip and artifact
    zip_copy = r"d:\antigravity\pro-gamer\pro-gamer.zip"
    shutil.copy(final_apk, zip_copy)
    shutil.copy(final_apk, r"C:\Users\user\.gemini\antigravity\brain\17ba901c-f92b-4a0f-8c20-604ed502baa4\pro-gamer.apk")

    apk_size = os.path.getsize(final_apk)
    print(f"SUCCESS: Generated signed APK at {final_apk} ({apk_size / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    build()
