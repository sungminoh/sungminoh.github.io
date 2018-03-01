---
layout: post
title:  "[Effective Python] 6. Built-in Modules"
categories: development/python
---



## 6. Built-in Modules

### 42. Define Function Decorators with `functors.wraps`

데코레이터로 함수를 감싸서 함수 수행 전후에 추가적인 작업을 할 수 있다.

예를들어 함수의 인자와 리턴값을 기록하는 데코레이터를 활용하면 디버깅에 용이하다.

```python
def trace(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print('%s(%r, %r) -> %r' % (func.__name__, args, kwargs, result))
        return result
    return wrapper

@trace
def fibonacci(n):
    """Return the n-th Fibonacci number"""
    if n in (0, 1):
        return n
    return (fibonacci(n - 2) + fibonacci(n - 1))

fibonacci(3)
# fibonacci((1,), {}) -> 1
# fibonacci((0,), {}) -> 0
# fibonacci((1,), {}) -> 1
# fibonacci((2,), {}) -> 1
# fibonacci((3,), {}) -> 2
```

잘 작동하긴 하지만, 함수를 직접 출력해 보면 함수의 이름이 `trace`로 바뀌어 있다.

```python
print(fibonacci)  # <function trace.<locals>.wrapper at 0x107f7ed08>
```

이는 디버거나, 오브젝트 시리얼라이저와 같이 함수의 내부를 들여다보는 기능에서 문제가 될 수 있다.

```Python
help(fibonacchi)  # Help on function wrapper in module __main__: wrapper(*args, **kwargs)
```

이를 해결하기 위해서는 데코레이터 작성을 도와주는 데코레이터인 `function tools` 모듈의 `wraps` 헬퍼 함수를 이용하면 된다. 이는 `wrapper` 함수에 적용되어서, 내부 함수의 메타 정보를 외부로 복사한다.

```python
def trace(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # ...
    return wrapper

@trace
def fibonacchi(n):
    # ...

help(fibonacchi)
# Help on fibonacchi in module __main__:
# fibonacchi(n)
#     Return the n-th Fibonacci number
```

- 데코레이터는 런타임에서 함수가 다른 동작을 하도록 수정될 수 있게 한다.
- 데코레이터는 디버거와 같이 함수 내부를 들여다보는 경우에 문제가 될 수 있다.
- `functiontools` 모듈의 `wraps` 데코레이터는 이런 문제를 해결하면서 데코레이터를 작성할 수 있게 한다.



### 43. Consider `contextlib` and `with` Statements for Reusable `try/finally` Behavior

`contextlib` 모듈에는 함수나 오브젝트를 `with` 구문에 쓸 수 있게 하는 `contextmanager`데코레이터가 있다. `__enter__`과 `__exit__`을 직접 구현하는 방법보다 쉽다.

여러 로그레벨에서 로그를 남기는 함수가 있고, 경우에 따라 로그레벨을 조정하고 싶은 경우를 생각해보자. `@contextmanager` 데코레이터가 달린 함수를 이용하면, `with`구문 내에서 로그레벨을 바꿀 수 있다.

```python
def my_function():
    logging.debug('Some debug data')
    logging.error('Error log here')
    logging.debug('More debug data')

my_function()  # Error log here (기본은 WARNING이므로 ERROR 단계의 로그만 출력된다.)

@contextmanager
def debug_logging(level):
    logger = logging.getLogger()
    old_level = logger.getEffectiveLevel()
    logger.setLevel(level)
    try:
        yield
    finally:
        logger.setLevel(old_level)

with debug_logging(logging.DEBUG):
    print('Inside:')
    my_function()
print('After:')
my_function()

## 출력
# Inside:
# Some debug data
# Error log here
# More debug data
# After:
# Error log here
```

#### Using `with` Targets

`with` 구문은 오브젝트를 반환하는데, `as` 구문으로 이를 변수에 할당해서 컨텍스트를 직접적으로 사용할 수 있다. `contextmanager`로 만든 함수에서는 `yield` 뒤에 반환할 오브젝트를 명시하면 된다.

```python
@contextmanager
def log_level(level, name):
    logger = logging.getLogger(name)
    old_level = logger.getEffectiveLevel()
    logger.setLevel(level)
    try:
        yield logger
    finally:
        logger.setLevel(old_level)

with log_level(logging.DEBUG, 'my-log') as logger:
    logger.debug('This is my message!')   # 출력된다.
    logging.debug('This will not print')  # 출력되지 않는다.

logger = logging.getLogger('my-log')
logger.debug('Debug will not print')  # 출력되지 않는다.
logger.error('Error will print')      # 출력된다.
```

- `with` 구문으로 `try/finally` 구문을 재활용 할 수 있다.
- `contextlib`  모듈의 `contextmanager` 데코레이터는 함수를 `with`구문에서 쓸 수 있게 만들어준다.
- `contextmanager`로 만든 함수에서 `yield`된 오브젝트는 `as`구문으로 받아서 사용할 수 있다.



### 44. Make `pickle` Reliable with `copyreg`

- `pickle` 모듈을 이용해 오브젝트를 파이트로 시리얼라이즈 하고 디시리얼라이즈 함으로써 다른 Python 프로그램에서 사용할 수 있다. 하지만 이 포맷은 안전하지 않아서, 악의적인 `pickle` 데이터는 디시리얼라이즈한 쪽에 문제를 일으킬 수 있다. (반면에 json 데이터는 신뢰할 수 있는 프로그램간에도 안전하게 데이터를 전달할 수 있다.) 따라서 신뢰할 수 있는 파이썬 프로그램 사이에서만 이용해야 한다.

`pickle`로 오브젝트를 파일에 써두었는데, 추후에 클래스에 새로운 어트리뷰트를 추가하여 재정의했다고 해보자. 이 상황에서 덤프해두었던 파일을 디시리얼라이즈하면, 새로 선언한 클래스의 인스턴스로 복원되지만 추가된 어트리뷰트는 반영되지 않는다.

```python
class GameState(object):
    def __init__(self):
        self.level = 0
        self.lives = 4

state = GameState()
state.level += 1
state.lives -= 1

state_path = '/tmp/gamestate.bin'
with open(state_path, 'wb') as f:
    pickle.dump(state, f)

class GameState(object):
    def __init__(self):
        # ...
        self.points = 0  # 새로운 어트리뷰트 추가

with open(state_path, 'rb') as f:
    state_after = pickle.load(f)

print(state_after.__dict__)  # {'lives': 3, 'level': 1} point 어트리뷰트가 없다.
```

- `copyreg` 모듈은 시리얼라이즈를 관장할 함수를 지정할 수 있어서, `pickle` 과정을 관리하고 더 신뢰성있게 만들 수 있다.

#### Default Attribute Values

앞 예제 상황을 간단히 해결하는 방법은 생성자에 기본값을 넣는 것이다.

```python
class GameState(object):
    def __init__(self, level=0, lives=4, points=0):
        self.level = level
        self.lives = lives
        self.points = points
```

이 생성자를 pickling의 생성자로 하기 위해서는, `GameState`오브젝트를 받아 `copyreg` 모듈에서 사용할 파라메터들의 튜플로 만드는 helper 함수가 필요하다. 이 튜플에는 unpickling을 위한 helper 함수와, 그 함수에 전할 인자도 포함되어있다.

```python
def pickle_game_state(game_state):  # pickling하기 위한 helper 함수이다.
    kwargs = game_state.__dict__
    return unpickle_game_state, (kwargs, )  # unpickling할 함수와 사용할 파라메터를 반환한다.

def unpickle_game_state(kwargs):
    return GameState(**kwargs)

copyreg.pickle(GameState, pickle_game_state)  # copyreg 모듈에 등록한다.

state = GameState()
state.points += 1000
serialized = pickle.dumps(state)

class GameState(object):
    def __init__(self, level=0, lives=4, points=0, magic=5):  # 어트리뷰트를 추가한다.
        # ...

state_after = pickle.loads(serialized)
print(state_after.__dict__)  # {'level': 0, 'points': 1000', 'magic': 5, 'lives': 4}
```

디시리얼라이즈를 위한 함수로 지정된 `unpick_game_state`가 `GameState` 생성자를 직접 호출하기 때문에, 새로운 어트리뷰트가 빠지지 않고 추가된다.

#### Versioning Classes

어트리뷰트를 삭제하는 등 하위호환성을 없애는 경우가 있다. 예를들어 `lives` 어트리뷰트를 삭제하고 디시리얼라이즈 하게 되면, 존재하지 않는 어트리뷰트를 생성자에 넣게 되므로 `TypeError: __init__() got an unexpected keyword argument 'lives'` 라는 에러가 나게 된다.

이럴 때엔 `copyreg`에 등록하는 helper함수에서 버전 파라메터를 추가해주어 해결한다.

```python
def pickle_game_state(game_state):
    kwargs = game_state.__dict__
    kwargs['version'] = 2  # 버전 정보를 추가한다.
    return unpickle_game_state, (kwargs,)

def unpickle_game_state(kwargs):
    version == kwargs.pop('version', 1)
    if version == 1:         # 버전을 확인하고
        kwargs.pop('lives')  # 필요없는 어트리뷰트를 제거한다.
    return GameState(**kwargs)
```

#### Stable Import Paths

클래스 이름을 변경하거나 다른 모듈로 위치를 옮기는 경우에도 문제가 된다. 클래스 이름을 바꾼다면 디시리얼라이즈 할 클래스를 찾을수 없기 때문에 `AttributeError: Can't get attribute 'GameState' on <module '__main__' from 'my_code.py'>` 라는 에러가 나게 된다.

사실 pickle된 데이터에는 복원을 위한 시리얼라이즈된 오브젝트 클래스의 임포트 경로가 저장되어있기 때문이다.

```python
print(serialized[:25])  # b'\x80\x03c__main__\nGameState\nq\x00)'
```

하지만 `copyreg` 모듈을 사용하면 클래스 경로 대신에 unpickle helper 함수의 경로가 담기게 된다.

```python
copyreg.pickle(BetterGameState, pickle_game_state)
state = BetterGameState()
serialized = pickle.dumps(state)
print(serialized[:35])  # b'\x80\x03c__main__\nunpickle_game_state\nq\x00}'
```

이제 대신 `unpickle_game_state` 함수의 경로는 바꾸면 안된다.



### 45. Use `datetime` Instead of `time` for Local Clocks

Coordinated Universal Time(UTC)가 스탠다드이긴 하지만, 사람은 로컬 시간을 사용한다.

- 에러가 생기기 쉬운 `time` 모듈보다 `datetime` 모듈을 사용하도록 하자. `putz` 모듈과 함께 쓰기에도 좋다.

#### The `time` Module

`time` 모듈에는 `localtime` 함수가 있어서 UNIX 타임스탬프를 컴퓨터의 타임존에 맞는 로컬 시간으로 바꿀 수 있다.

```python
from time import localtime, strftime, time
now = time()
local_tuple = localtime(now)
time_format = '%Y-%m-%d %H:%M:%S'
time_str = strftime(time_format, local_tuple)
print(time_str)  # 2017-07-25 11:54:30
```

로컬 시간에서 UCT로 바꾸기 위해서는 `strptime`으로 문자열을 파싱하고 `mktime`으로 로컬시간에서 UNIX 타임스탬프로 변환한다.

```python
from time import mktime, strptime
time_tuple = strptime(time_str, time_format)
utc_now = mktime(time_tuple)
print(utc_now)  # 1500951270.0
```

타임존을 바꿀 때는 어떻게 해야할까. 타임존은 계속해서 바뀌기 때문에 `time`, `local time`, `strptime`으로 직접 계산하는건 좋지 않다.

대부분의 OS에는 타임존을 자동으로 관리하는 설정파일이 있는데 `time` 모듈은 이걸 이용한다. 이런 플랫폼 의존성 때문에 `time` 모듈의 동작은 OS의 C 코드에 따라 달라질 수 있다.

- 여러 환경에서 안정적으로 동작하지 않으므로 `time` 모듈의 사용을 지양하고, 꼭 사용해야 한다면 UTC와 호스트 컴퓨터의 로컬 시간 사이의 전환에만 사용한다.

```python
parse_format = '%Y-%m-%d %H:%M:%S %Z'

depart_sfo = '2014-05-01 15:45:16 PDT'           # Pacific Daylight Time
time_tuple = strptime(depart_sfo, parse_format)  # 플래폼에 따라 동작할 수도 있고, 에러날수도 있다.
arrival_nyc = '2014-05-01 23:33:24 EDT'           # Eastern Daylight Time
time_tuple = strptime(depart_nyc, parse_format)  # 플래폼에 따라 동작할 수도 있고, 에러날수도 있다.
```

#### The `datetime` Module

`datetime` 모듈을 사용해서도 UTC 와 로컬 시간을 바꿀 수 있다.

```python
from datetime import datetime, timezone
now = datetime.now()
now_utc = now.replace(tzinfo=timezone.utc)
now_local = now_utc.astimezone()
print(now_utc)    # 2017-07-25 12:45:33.692172+00:00
print(now_local)  # 2017-07-25 21:45:33.692172+09:00
```

로컬 시간을 UNIX 타임스탬프로 바꿀 수 있다.

```python
time_tuple = now.timetuple()
utc_now = mktime(time_tuple)
print(utc_now)  # 1500954333.0
```

`time` 모듈과는 달리 `datetime` 모듈은 로컬 시간을 다른 로컬 시간으로 바꾸는 것이 안정적이다. UTC 밖에 없긴 하지만 `tzinfo` 클래스와 관련 메소드로 타임존을 조작할 수도 있다.

- 다른 타임존간의 변환이 필요할 때는 `time`보다는 `datetime`을 쓴다.

외부 모듈인 [`pytz`](https://pypi.python.org/pypi/pytz/) 모듈은 대부분의 타임존에 대한 정보를 가지고 있으므로 이를 이용하면 다른 타임존을 쓸 수 있다.

- 타임존 간의 변환 작업을 할 때에는 UTC로 바꾸어서 조작하고, 마지막에 로컬 시간으로 변환하도록 한다.

```python
time_format = '%Y-%m-%d %H:%M:%S'

arrival_nyc = '2014-05-01 23:33:24'
nyc_dt_naive = datetime.strptime(arrival_nyc, time_format)
eastern = pytz.timezone('US/Eastern')
nyc_dt = eastern.localize(nyc_dt_naive)  # datetime에 그냥 타임존을 붙인다.

utc_dt = pytz.utc.normalize(nyc_dt)      # 타임존을 바꾼다.
#      = nyc_dt.astimezone(pytz.utc)
print(nyc_dt)    # 2014-05-01 23:33:24-04:00
print(utc_dt)    # 2014-05-02 03:33:24+00:00

pacific = pytz.timezone('US/Pacific')
sf_dt = pacific.normalize(utc_dt)
print(sf_dt)     # 2014-05-01 20:33:24-07:00

nepal = pytz.timezone('Asia/Katmandu')
nepal_dt = nepal.normalize(utc_dt)
print(nepal_dt)  # 2014-05-02 09:18:24+05:45
```



### 46. Use Built-in Algorithms and Data Structures

#### Double-ended Queue

`collections` 모듈에는 `deque` 클래스가 있다. `deque`는 헤드, 테일에서의 삽입, 제거를 상수시간에 수행한다. `list`에도 `append`, `pop` 메소드가 있어서 테일에서 삽입 제거하는 것은 상수시간에 처리된다. 하지만, 헤드에 삽입하고 삭제하는 것은 선형시간이 들어간다.

#### Ordered Dictionary

`dict`는 해시테이블의 구현 문제로, 키 값의 순서를 보장하지 않는다. 같은 키만 가진 같은 크기의 딕셔너리라 하더라도, 다른 키들을 어떻게 넣고 삭제했는지에 따라 순서가 다를 수 있다.

`collections` 모듈의 `OrderedDict`는 키값의 순서를 보장한다.

#### Default Dictionary

`collections` 모듈의 `defaultdict` 클래스는 키가 없을 때, 사용할 기본값을 리턴하는 함수를 인자로 받는다.

#### Heap Queue

`heapq` 모듈의 `heappush`, `heappop` 함수를 이용하여 기본 `list`를 min heap으로 사용할 수 있다. `nsmallest(n, l)`는 리스트에서 작은 순서대로 n개의 리스트를 반환한다. 각 작업은 O(log)에 수행된다

`sort` 메소드를 쓰더라도, 힙은 유지된다.

#### Bisection

`index`와 같이 리스트에서 값을 찾는 작업은 선형시간이 들어간다. `bisect` 모듈에는 소트된 리스트에서 바이너리서치를 해주는 함수가 있다. `bisect_left`는 같은 값이 있을 때 왼쪽 인덱스를, `bisect_right`는 오른쪽 인덱스를 반환한다. 인덱스는 삽입될 자리이다.

#### Iterator Tools

`itertools` 모듈에는 이터레이션에서 유용하게 사용할 수 있는 함수가 많다. Python2에는 없는 함수도 있지만, `help(itertools)`의 문서를 보고 쉽게 구현할 수 있다.

`itertools` 모듈에는 다음과 같은 것들이 있다.

- 이터레이터를 연결하는 것들
  - `chain`: 여러 이터레이터를 하나의 이터레이터로 만들어준다.
  - `cycle`: 이터레이터의 아이템을 영원히 반복한다.
  - `tee`: 하나의 이터레이터를 여러개로 병렬적인 이터레이터로 분할한다.
  - `zip_longest`: 길이가 다른 두 이터레이터를 `zip`한다.
- 필터하는 것들
  - `islice `: 이터레이터를 카피하지 않고 인덱스로 자른다.
  - `takewhile`: 주어진 함수가 `True`를 반환할 때까지의 아이템들을 반환한다.
  - `dropwhile`: 주어진 함수가 `True`를 반환하는 아이템들을 빼고 나머지를 반환한다.
  - `filterfalse`: 주어진 함수가 `False`를 반환하는 아이템을 추린다. `filter` 함수의 반대 버전이다.
- 아이템들의 조합을 구하는 것들
  - `product`: 주어진 리스트들로 아이템들의 Cartesian product를 만들어 반환한다.
  - `permutations`: 주어진 리스트에서 n개 원소를 퍼뮤테이션을 구한다.
  - `combination`: 주어진 리스트에서 n개 원소의 콤비네이션을 구한다.



### 47. Use `decimal` When Precision Is Paramount

Python은 integer는 크기에 상관 없이 표현할 수 있고, double-precision floating point는 IEEE754 표준을 따른다. 복소수를 표현하기 위한 타입도 있다.

하지만 이런 타입들이 아쉬운 경우가 있다. `decimal` 모듈의 `Decimal` 클래스를 이용하면 28 decimal point를 이용하는  고정소수점 방식으로 표현할 수 있어서(필요에 따라 더 많이 표현할 수 있다.) IEEE754의 floating point의 문제를 피할 수 있다.

```python
cost = 1.45 * 222 / 60
print(cost)            # 5.364999999999999
print(round(cost, 2))  # 5.36 (실제로는 5.365)

cost = Decimal('1.45') * Decimal('222') / Decimal('60')
print(cost)            # 5.365
```

`Decimal` 클래스에는 원하는 자리에서 올림 할 수 있는 `quantize` 함수가 있다.

```python
cost = Decimal('0.05') * Decimal('5') / Decimal('60')
print(cost)    # 0.004166666666666666666666666667
rounded = cost.quantize(Decimal('0.01'), rounding=decimal.ROUND_UP)
print(rounded) # 0.01
```

하지만 여전히 1/3과 같은 경우는 정확히 표현할 수 없는데, 분수를 정확히 표현하고 싶을 땐 `fractions`모듈의 `Fraction`클래스를 사용하면 된다.



### 48. Know Where to Find Community-Built Modules

Python의 메인 모듈 레포지토리인 Python Package Index([https://pypi.python.org](https://pypi.python.org))에서 원하는 모듈을 설치할 수 있다. 설치는 `pip`명령어로 하는데, `pyvenv`와 함께 사용해서 설치된 패키지들 목록을 관리할 수 있다.
