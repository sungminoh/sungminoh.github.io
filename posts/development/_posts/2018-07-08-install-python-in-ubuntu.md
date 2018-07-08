---
layout: post
title:  "우분투에 파이썬 설치하기"
tags: python linux
---

## python 2.7 & pip2 설치

```shell
sudo apt-get install python-software-properties -y
```





패키지를 다운받기 위한 pip를 설치한다.

```shell
sudo apt-get install python-pip -y
pip list
```

> ```
> ...
> You are using pip version 8.1.1, however version 10.0.1 is available.
> You should consider upgrading via the 'pip install --upgrade pip' command.
> ```

<br>


업그레이드 하란 대로 업그레이드하면 `can not import name main` 하는 에러가 뜬다.

```shell
pip install --upgrade pip
pip list
```

> ```
> Traceback (most recent call last):
>   File "/usr/bin/pip", line 9, in <module>
>     from pip import main
> ImportError: cannot import name main
> ```

```shell
python -m pip --version
pip 10.0.1 from /home/ubuntu/.local/lib/python2.7/site-packages/pip (python 2.7)
```


<br>


`pip install --upgrade pip` 를 하면, `~/.local` 에 pip가 설치되는데, `pip` 명령어는 `/usr/bin` 에 있는 예전 pip를 사용하기 때문이다.

확인해보자.

```shell
ls -l /usr/bin | grep pip
```

> ```
> -rwxr-xr-x  1 root   root     292 Nov 10  2016 pip
> -rwxr-xr-x  1 root   root     283 Nov 10  2016 pip2
> ```

```shell
head /usr/bin/pip2
```

> ```
> #!/usr/bin/python
> # EASY-INSTALL-ENTRY-SCRIPT: 'pip==8.1.1','console_scripts','pip2'
> __requires__ = 'pip==8.1.1'
> import sys
> from pkg_resources import load_entry_point
>
> if __name__ == '__main__':
>     sys.exit(
>         load_entry_point('pip==8.1.1', 'console_scripts', 'pip2')()
>     )
> ```


<br>


 그러므로 `sudo pip install --upgrade pip` 로 업그레이드 하도록 하자. 그러면 pip명령어는 `usr/bin/`에 있는 pip들을 무시하고,  `/usr/local/bin/`에 새로 생긴 excutable 을 실행시킨다.

```shell
which pip
```

> ```
> /usr/local/bin/pip
> ```


<br>
<br>


## python 3.6 & pip3 설치

만약 Ubuntu 16.10 이전 버전을 사용하고 있다면, python3은 3.5버전이 설치된다.

```shell
ls -l /usr/bin | grep python
```

> ```
> ...
> lrwxrwxrwx 1 root   root           9 Mar 23  2016 python3 -> python3.5
> -rwxr-xr-x 2 root   root     4464400 Nov 28  2017 python3.5
> ...
> ```

pip3도 설치하고 업그레이드한다.

```shell
sudo apt install python3-pip -y
sudo pip3 install --upgrade pip  # sudo로 업그레이드한다.
```


<br>


아래와 같은 멋진 기능을 쓰기 위해서 python 3.6을 설치해보자.

```python
print(f'{f.__name__}({args}, {kwargs}) is called')
```

그냥 PPA를 추가해주고 설치하면된다.

```shell
sudo add-apt-repository ppa:jonathonf/python-3.6
sudo apt-get update
sudo apt-get install python3.6 -y
```

<br>

기본 python3을 python3.6으로 바꿔주고,

```shell
sudo rm -f /usr/bin/python3
sudo ln -s /usr/bin/python3.6 /usr/bin/python3
```





pip 도 python3.6으로 바꿔준다.

```shell
curl https://bootstrap.pypa.io/get-pip.py | sudo python3.6
```


