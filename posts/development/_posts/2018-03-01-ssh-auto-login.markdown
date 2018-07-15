---
layout: post
title:  "SSH 자동 로그인"
tags: linux
img: ssh.png
---



ssh (secure shell)을 이용하여 서버에 접속할때 매번 username@server.address.com으로 접속하고 비밀번호를 입력해야 하는 번거로움이 있다. 이를 간단하게 하는 방법을 정리해 본다.



## 0. SSH key

ssh key는 [공개키 암호화 방식](https://ko.wikipedia.org/wiki/%EA%B3%B5%EA%B0%9C_%ED%82%A4_%EC%95%94%ED%98%B8_%EB%B0%A9%EC%8B%9D)을 통해 보안을 유지한다. 서버는 공개키(public key)를 가지고, 클라이언트는 비공개키(private key)를 가지는데 이 두키를 비교함으로써 인증을 하는 방식이다. 공개키는 데이터를 암호화하는데 사용되며, 이는 공개될 위험이 있다. 하지만 비공개키가 없으면 이를 해독하지 못한다.



## 1. 클라이언트에서

터미널에서 `ssh-keygen -t rsa` 를 수행한다. `-t rsa`는 [rsa 암호화 방식](https://ko.wikipedia.org/wiki/RSA_%EC%95%94%ED%98%B8)으로 키를 생성하기 위한 옵션이다.

그러면 key를 저장할 경로(기본경로는 `$ ~/.ssh`)를 묻고, passphrase를 묻는다. 모두 그냥 엔터를 눌러 넘어가자.

```shell
[sungmin@client ~]$ ssh-keygen -t rsa
Generating public/private rsa key pair.
Enter file in which to save the key (~/.ssh/id_rsa):
Created directory '~/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in ~/.ssh/id_rsa.
Your public key has been saved in ~/.ssh/id_rsa.pub.
```

`.ssh` 폴더에 들어가보면 아래와 같은 rsa가 생성된 것을 볼 수 있다. `id_rsa`는 비공개키, `id_rsa.pub`은 공개키이다.

```shell
[sungmin@client ~]$ cd .ssh
[sungmin@client .ssh] $ ls
id_rsa  id_rsa.pub
```

`.ssh`폴더에서 아래 명령어를 순서대로 수행한다. 공개키를 서버에 넘기고, 소유자에게만 비공개키의 읽기 쓰기 권한을 준다. `id_rsa.pub`에 있는 내용을 authorized_keys에 옮겨 쓰고 삭제하며, `chmod 600`으로 소유자에게만 읽기 쓰기 권한을 준다.

``` shell
scp ./id_rsa.pub sungmin@server.address.com:.ssh/
chmod 600 id_rsa
```



## 2. 서버에서

이제 서버의 `.ssh` 폴더에 들어가서 아래 명령어들을 수행한다. 공개키의 내용을 quthrized_keys에 옮겨쓰고 삭제한다. 서버는 클라이언트가 접속 요청을 하면, 이 authrized_keys의 내용을 보고 인증된 사용자인지 확인하게 된다.

```shell
cat id_rsa.pub >> authorized_keys
chmod 600 authorized_keys
rm id_rsa.pub
```



## 3. 만약 여러 서버를 등록하고자 한다면

비공개키 `id_rsa`의 이름을 바꾸어 다른 비공개키와 겹치지 않도록 하고, `config`파일에 접속정보를 설정한다.

```shell
cd .ssh
mv id_rsa example.rsa
```

`config`파일 내용.

```shell
Host server1
HostName server1.address.com
IdentityFile ~/.ssh/server1.rsa
User sungmin
Port 7910

Host myserver
HostName foo.bar.com
IdentityFile ~/.ssh/filename.rsa
User username
```



## 4. 사용

이제 로컬에서 다음과 같은 명령어로 편하게 리모트 서버에 접속할 수 있다.

```shell
ssh server1
ssh myserver
```



## 5. 참고

1. [http://www.rebol.com/docs/ssh-auto-login.html](http://www.rebol.com/docs/ssh-auto-login.html)
2. [https://opentutorials.org/module/432/3742](https://opentutorials.org/module/432/3742)


