cd D:\Dropbox\Voze-ionic\platforms\android\build\outputs\apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android-release-unsigned.apk alias_name 
del Vooze.apk
zipalign -v 4 android-release-unsigned.apk Vooze.apk
xcopy /s/y "D:\Dropbox\Voze-ionic\platforms\android\build\outputs\apk\Vooze.apk" "D:\Dropbox\Voze-ionic\published app"
xcopy /s/y "D:\Dropbox\Voze-ionic\platforms\android\build\outputs\apk\Vooze.apk" "D:\Dropbox\FYP 2015 Term 1\mobile apk"
