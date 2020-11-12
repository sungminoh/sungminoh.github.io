---
layout: post
title:  "Ubuntu EC2 세팅하기"
tags: linux
img: ubuntu.svg
---


### Password
```
# 루트계정에 패스워드 지정
passwd root
sudo vi /etc/ssh/sshd_config

# 아래 두개 옵션을 yes로 하고 저장후 닫기
PermitRootLogin yes
PasswordAuthentication yes

# sshd 재시작
sudo service ssh restart
```



### [jenkins](https://wiki.jenkins.io/display/JENKINS/Installing+Jenkins+on+Ubuntu)

```
wget -q -O - https://pkg.jenkins.io/debian/jenkins-ci.org.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install jenkins
```



### hostname

```
# /ect/hosts
127.0.1.1 www.hostname.com

# /etc/hostname
www.hostname.com

sudo hostnamectl set-hostname www.hostname.com
```


