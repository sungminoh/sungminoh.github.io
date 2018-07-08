---
layout: post
title:  "Decorator로 함수 실행시간 기록하기"
tags: python
---

## Decorator로 함수 실행시간 로깅하고, 이메일 알람보내기

데이터 전처리나 학습을 시켜놓고 며칠 뒤 결과를 확인하는 경우가 많은데, 종종 중간에 작업이 실패하기도 하고 생각보다 빨리 끝나있을 때도 있다.

만약 돌려놓은 함수가 끝났는지, 끝났다면 성공적으로 끝났는지 실패했는지 바로 알 수 있다면, 다음 작업을 이어서 수행하거나 디버깅후 재실행 할 수 있을 것이다.

이번 글에서는 함수의 실행시간을 기록하고, 나아가 이메일 알림까지 보내주는 데코레이터를 만들어본다.



### 1단계, 함수 실행시간을 기록해주는 아주 간단한 데코레이터를 만들어보자.

```python
from datetime import datetime
from functools import wraps

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = datetime.now()
        result = func(*args, **kwargs)
        end = datetime.now()
        print(f'Success. {end-start} taken for {func.__name__}')
        return result
    return wrapper

@timed
def foo():
    print('Hello World')
```

```
>>> foo()
Hello World
Success. 0:00:00.000023 taken for foo
```

<br/>

decorator를 사용할 때에는 `functools.wraps` 으로 wrapper를 감싸지 않으면 함수의 메타정보를 잃어버리게되므로 주의한다.

```python
def nothing(func):
    def func_name_will_be_overwritten(*args, **kwargs):
        return func(*args, **kwargs)
    return func_name_will_be_overwritten

@nothing
def foo():
    print('Hello World')
```

```
>>> print(foo.__name__)
func_name_will_be_overwritten
```

<br/>

<br/>

### 2단계, 별도의 로거를 파라메터로 받아 로깅한다.

파라메터를 별도로 받는 decorator를 작성하려면 한겹 더 감싸준다.

```python
def timed(logger=None, level=10):
    log = print
    if isinstance(logger, logging.getLoggerClass()):
        log = lambda m: logger.log(level, m)
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = datetime.now()
            result = func(*args, **kwargs)
            end = datetime.now()
            log(f'Success. {end-start} taken for {func.__name__}')
            return result
        return wrapper
    return decorator

@timed(logger)
def foo():
    print('Hello World')
```

```
>>> foo()
Hello World
2018-07-08 16:02:23,926 DEBUG    4:test.py - Success. 0:00:00.000025 taken for foo
```



이렇게 별도의 파라메터를 받는 데코레이터는 안타깝게도 항상 `()` 가 필요하다. 기본 파라메터를 사용할 때엔 괄호 없이 사용하고 싶다면 아래와 같이 편법을 사용하는 수 밖에 없다.

```python
def decorator_with_optional_parameter(param=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(param)
            return func(*args, **kwargs)
        return wrapper
    if callable(param):  # params가 callable이면 ()없이 쓰여서 함수가 바로 들어왔다고 가정한다.
        return decorator(param)
    else:
        return decorator

@decorator_with_optional_parameter()
def foo():
    print('Hello')

@decorator_with_optional_parameter
def bar():
    print('World')
```

```
>>> foo()
None
Hello
>>> bar()
<function bar at 0x10778ea60>
World
```

<br/>

<br/>

### 3단계, caller, parameter와 같은 좀 더 많은 정보를 기록한다.

```python
from inspect import getframeinfo, currentframe

def timed(logger=None, level=10):
    log = print
    if isinstance(logger, logging.getLoggerClass()):
        log = lambda m: logger.log(level, m)
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 파라메터 정보를 출력하기 위한 정보를 구성한다.
            parameters = [repr(x) for x in args]
            if kwargs:
                parameters.append(repr(kwargs))
            funcname = f"{func.__name__}({', '.join(parameters)})"

            # caller 정보를 출력한다.
            caller = getframeinfo(currentframe().f_back)
            if caller:
                log(f'{funcname} is called by {caller.function} in {caller.lineno}:{caller.filename}')
            else:
                log(f'{funcname} is called')

            # 시간을 기록하고 함수를 실행한다.
            start = datetime.now()
            result = func(*args, **kwargs)
            end = datetime.now()
            log(f'Success. {end-start} taken for {funcname}')
            return result
        return wrapper
    return decorator

@timed()
def foo(name):
    print(f'Hello World {name}')
```

```
>>> foo('John')
foo('John') is called by <module> in 40:test.py
Hello World John
Success. 0:00:00.000013 taken for foo('John')
```

<br/>

<br/>

### 4단계, 함수 성공/실패시 이메일을 보내도록 한다.

```python
import traceback

def timed(logger=None, level=10, notify=False):
    log = print
    if isinstance(logger, logging.getLoggerClass()):
        log = lambda m: logger.log(level, m)
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 파라메터 정보를 출력하기 위한 정보를 구성한다.
            parameters = [repr(x) for x in args]
            if kwargs:
                parameters.append(repr(kwargs))
            funcname = f"{func.__name__}({', '.join(parameters)})"

            # caller 정보를 출력한다.
            caller = getframeinfo(currentframe().f_back)
            if caller:
                log(f'{funcname} is called by {caller.function} in {caller.lineno}:{caller.filename}')
            else:
                log(f'{funcname} is called')

            # 시간을 기록하고 함수를 실행한다.
            start = datetime.now()
            # 함수의 성패에 따라 적절한 메일을 보낸다.
            try:
                result = func(*args, **kwargs)
            except Exception as e:
                end = datetime.now()
                msg = f'Fail. {end-start} taken for {funcname}: '
                log(msg, e)
                send_email(msg, traceback.format_exc())
                raise e
            end = datetime.now()
            msg = f'Success. {end-start} taken for {funcname}'
            log(msg)
            send_email(msg, str(result))
            return result
        return wrapper
    return decorator

@timed()
def foo(name):
    print(f'Hello World {name}')
```

<br/>

이메일을 보내는 함수는 대충 이렇게 작성한다.

```python
import smtplib
from email.mime.text import MIMEText

def send_email(sender, receivers, subject, content):
    try:
        msg = MIMEText(content.encode('utf-8'), 'html', _charset='utf-8')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = ', '.join(receivers)
        s = smtplib.SMTP('localhost')
        s.sendmail(sender, receivers, msg.as_string())
        s.quit()
        print('Successfully sent the mail to %s' % msg['To'])
    except Exception as e:
        print('Fail to send the mail.', e)
```

```
>>> foo()
foo() is called by <module> in 71:test.py
Fail. 0:00:00.000012 taken for foo():  foo() missing 1 required positional argument: 'name'
Successfully sent the mail to receiver1, receiver2
Traceback (most recent call last):
  File "test.py", line 71, in <module>
    foo()
  File "test.py", line 57, in wrapper
    raise e
  File "test.py", line 51, in wrapper
    result = func(*args, **kwargs)
TypeError: foo() missing 1 required positional argument: 'name'
```


