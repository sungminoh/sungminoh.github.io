---
layout: post
title:  "Mac sleep에서 깨어날 때 명령어 실행하기"
tags: mac
published: true
---

# Mac에서 자동으로 명령어 실행하기

때때로 맥에서 주기적으로 어떤 특정 명령어를 실행하고 싶을 때가 있다. ~~(일정 시간이 지나면 만료되는 토큰을 자동으로 재발급 한다던지...)~~

대부분의 경우 cron을 이용하면 되는데, `crontab -e` 으로 cron 설정을 에디터에서 띄우고 아래와 같은 식으로 설정해 주면 된다.

```sh
0 * * * * [실행할 커맨드] > /tmp/cron.log 2>/tmp/cron.error.log
```

다만 cron은 맥이 깨어 있을 때에만 동작하므로, 맥을 처음 키거나 슬립에서 깨어났을 경우에는 명령어가 돌기 전인 상태 일 수 있다.

이럴땐 그냥 명령어를 직접 실행해도 되고 다음 크론 스케쥴까지 기다려도 되지만, 아무래도 컴퓨터의 상태가 그때 그때 다를 수 있다는게 여간 귀찮은게 아니므로 이것도 자동화 해본다.



# [SleepWatcher](https://www.bernhard-baehr.de/)

맥이 sleep에 빠지거나 혹은 wake up하는 상태 변경을 모니터링 하는 데몬이다. 이를 이용하면 sleep, wake up 을 트리거로 특정 작업을 수행할 수 있다.



## Install

```sh
brew install sleepwatcher
```

설치를 하고 나면 `/usr/local/Cellar/sleepwatcher/<version>/`에 `de.bernhard-baehr.sleepwatcher-20compatibility-localuser.plist` 와 같은 plist파일이 생긴다.

이를 `~/Library/LaunchAgents/` 로 적당하게 복사해준다.

```sh
cp /usr/local/Cellar/sleepwatcher/2.2.1/de.bernhard-baehr.sleepwatcher-20compatibility-localuser.plist ~/Library/LaunchAgents/my.sleepwatcher.plist
```



## Configure

아마 해당 plist 파일의 내용을 보면

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>de.bernhard-baehr.sleepwatcher</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/local/sbin/sleepwatcher</string>
		<string>-V</string>
		<string>-s ~/.sleep</string>
		<string>-w ~/.wakeup</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<true/>
</dict>
</plist>
```

와 같이 되어있을텐데, 이에 맞추어서 홈에 `.sleep`, `.wakeup` 파일을 생성하고 executable로 만든다.

```sh
touch ~/.wakeup; chmod +x ~/.wakeup;
touch ~/.sleep; chmod +x ~/.sleep
```

그리고 각 파일 안에, sleep이나 wake up 시 수행할 코드를 넣어두면 된다.



## Run

이제 데몬을 실행한다.

```sh
launchctl start ~/Library/LaunchAgents/my.sleepwatcher.plist
```

