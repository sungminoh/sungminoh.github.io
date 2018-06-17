---
layout: post
title:  "[Effective Python] 8. Production"
tags: python
---



## 8. Production

### 54. Consider Module-Scoped Code to Configure Deployment Environments

개발환경과 운영환경을 분리하거나 여러 프로덕션 환경에서 동작하는 코드를 작성해야 할 수 있다. `pyvenv`나 `virtualenv`같은 모듈이 패키지 구성을 똑같이 해주긴 하지만, 데이터베이스 연결과 같은 작업까지 동일하게 해주진 않는다. 게다가 개발 환경에서 테스트를 위해 운영환경과 같은 데이터베이스 서버를 구성하는 것은 번거로운 일이다. 이럴 때에는 설정 변수를 선언하고 모듈 내에서 적절한 분기를 태워 환경을 결정하도록 한다.

우선 전체 환경에 대한 설정을 `__main__` 파일에 상수로 넣을 수 있다.

```python
# dev_main.py
TESTING = True
import db_connection
db = db_connection.Database()

# prod_main.py
TESTING = False
import db_connection
db = db_connection.Database()
```

모듈에서는 `TESTING` 변수를 이용하여 분기한다.

```python
# db_connection
import __main__  # TESTING 변수를 사용하기 위해 __main__을 불러온다.

class TestingDatabase(object):
    # ...

class RealDatabase(object):
    # ...

if __main__.TESTING:
    Database = TestingDatabase
else:
    Database = RealDatabase
```

환경이 복잡해지고 설정파일이 더 많이 필요하다면 별도의 설정파일로 빼고, `configparser` 모듈로 접근하는 방법도 있다.

설정한 변수가 아니라, 만약 시스템에 따라 다른 코드가 동작하길 바란다면 `sys.platform` 변수나 `os.environ` 변수를 사용할 수 있다.



### 55. Use `repr` Strings for Debugging Output

디버깅할때 `print`를 사용할텐데, 그냥 사용하면 변수의 타입을 알지 못하는 경우가 있다.

```python
print(5)    # 5
print('5')  # 5
```

- `repr` 함수는 변수의 표현식을 문자열로 나타내 주며, `eval` 함수를 통해 원래 값으로 돌릴 수도 있다.

  ```python
  print(repr(5))    # 5
  print(repr('5'))  # '5'

  a = '\x07'
  print(repr(a))    # '\x07'
  b = eval(repr(a))
  assert a == b
  ```

- 포맷 스트링에서 표현식을 사용하고 싶다면, `%r` 포맷을 사용하면 된다.

- 클래스의 경우에는 별도로 `__repr__` 를 구현하거나, `__dict__` 어트리뷰트를 사용한다.



### 56. Test Everything with `unittest`

Python은 타입이 없고 동적으로 동작하기 때문에 사용하기 편하지만 런타임에 에러를 낼 수 있는 문제가 있다. 특히 동적 임포트 때문에 `SyntaxError`와 같은 에러가 런타임에 난다면 당황할 수 밖에 없다.

어떤 언어든 마찬가지 겠지만, Python에서는 특히 코드를 검증하기 위한 테스트가 반드시 필요하다.

- Python에서는 `unittest` 모듈을 사용하여 테스트코드를 작성할 수 있다.

다음 코드를 검증하는 테스코드를 작성해보자.

```python
# utils.py
def to_str(data):
    if isinstance(data, str):
        return data
    elif isinstance(data, bytes):
        return data.decode('utf-8')
    else:
        raise TypeError('Must supply str or bytes, found: %r' % data)
```

```python
# utils_test.py (test_utils.py 등 적절한 파일명으로 작성한다)
from unittest import TestCase, main
from utils import to_str

class UtilsTestCase(TestCase):
    def setUp(self):
        self.test_dir = TemporaryDirectory()

    def tearDown(self):
        self.test_dir.cleanup()

    def test_to_str_bytes(self):
        self.assertEqual('hello', to_str(b'hello'))

    def test_to_str_str(self):
        self.assertEqual('hello', to_str('hello'))

    def test_to_str_bad(self):
        self.assertRaises(TypeError, to_str, object())

if __name__ == '__main__':
    main()
```

- `TestCase`를 상속받아 테스트케이스를 작성한다. `assertEqual`, `assertTrue`, `assertRaises` 등의 메소드를 사용할 수 있다.
- 테스트 메소드는 `test_`로 시작한다.
- `setUp` 메소드는 다른 테스트 메소드가 시작되기 전에 수행되고, `tearDown`은 마지막에 수행된다.
- mock이 필요한 경우 `unittest.mock`을 사용하면 된다. Python2에서는 외부 패키지가 있다.
- `TestCase` 클래스는 연관성 있는 테스트를 묶어 작성한다. 많은 엣지케이스가 있는 경우는 하나의 함수만 테스트 할 수도 있고, 모듈 전체 혹은 클래스마다 작성할 수 있다.
- 모듈간 상호 동작을 테스트 하는 것은 인테그레이션 테스트로 유닛테스트는 다르다. 모두 확인해야한다.
- 커버리지 레포트 등이나 데이터 기반의 테스트를 위해서는 더 많은 기능을 제공하는 [`nose`](http://nose.readthedocs.org/)나 [`pytest`](http://pytest.org/)가 있다.




### 57. Consider Interactive Debugging with `pdb`

Python에는 `pub`라는 디버깅 툴이 있다.

- `set_trace` 메소드를 코드에서 사용하면, 해당 위치에서 프롬프트가 열린다.


- `#`으로 주석처리 하기 쉽도록 한줄로 `import pub; pdb.set_trace()`로 사용하는 경우가 많다.
- `locals` 명령어로 로컬 변수들을 보거나, `help`를 사용하거나, 새로운 클래스를 작성하고 기존 코드를 바꾸는 등 많은 일을 할 수 있다.
- 현재 상태를 들여다보기 위한 세가지 명령어가 있다.
  - `bt`: 콜스택을 출력한다. 현재 위치에 이르게 된 과정을 볼 수 있다.
  - `up`: 콜스택에서 한단계 위로 올라간다.
  - `down`: 콜스텍에서 한단계 아래로 내려간다.
- 코드 진행을 관리하는 명령어들이 있다.
  - `step`: 한줄 수행하고 다시 멈춘다. 만약 함수를 호출한다면, 해당 함수 내에서 멈춘다.
  - `next`: 한줄 수행하고 다시 멈춘다. 만약 함수를 호출한다면, 함수를 모두 수행하고 멈춘다.
  - `return`: 현재 함수의 수행을 마치고 콜스택의 상위에서 멈춘다.
  - `continue`: 다음 `set_trace`까지 진행한다.



### 58. Profile Before Optimizing

문자열 조작이나 제너레이터와 같이 느릴 것 같은 동작은 생각보다 빠르고, 어트리뷰트 접근이나 함수 호출과 같은 빠를 것 같은 동작은 생각보다 느리다. 실제 코드 중 어느 부분에서 시간을 많이 잡아먹는 지를 아는 것은 중요하며, 시간을 많이 쓰는 부분의 최적화에 집중할 수 있다.

- Python엔 프로파일을 위한 `profile` 모듈이 있다. 하지만 가능하면 사이드이펙트가 적은 `cProfile` 모듈을 사용하라.
- 코드를 정확히 프로파일 하기 위해서는 네트워크 사용과 같은 외부 영향이 없도록 해야 한다. 캐시를 사용하여 웜업 하라.
- 프로파일한 결과는 `pstats` 모듈의 `Stats` 클래스로 출력해 볼 수 있다.

```python
profiler = Profile()
profiler.runcall(foo)  # 프로파일 하고자 하는 함수를 runcall 메소드의 인자로 넘긴다.

stats = Stats(profiler)
stats.strip_dirs()
stats.sort_stats('cumulative')
stats.print_stats()
```

```
>>>
		20003 function calls in 1.812 seconds
	Ordered by: cumulative time
	ncalls	tottile	percall	cumtime	percall	filename:lineno(function)
	1		0.000	0.000	1.812	1.812	main.py:34(<lambda>)
	...
```

- 각 열의 의미는 다음과 같다.
  - `ncalls`: 프로파일링 동안 함수가 호출된 횟수.
  - `tottime`: 내부의 다른 함수 호출을 제외하고 해당 함수가 오롯히 사용한 전체 시간.
  - `tottime percall`: `tottime` / `ncalls`
  - `cumtime`: 내부의 함수 호출을 포함해서 함수가 사용한 전체 시간.
  - `cumtime percale`: `cumtime` / `calls`
- 만약 어떤 하위 함수가 어떤 함수에 의해 호출되었는 지를 상세히 보고 싶다면, `stats.print_callers` 함수를 사용하라.



### 59. Use `tracemalloc` to Understand Memory Usage and Leaks

CPython은 reference counting으로 garbage collecting한다. 싸이클 디텍터가 있어서 self-referencing하는 오브젝트들도 잡아낼 수 있다. Python을 사용하는 대부분의 경우 메모리 사용을 신경쓸 필요가 없지만, 메모리 누수가 발생하는 경우가 있으며, 이럴 때엔 메모리 사용을 프로파일할 필요가 있다.

- `gc` 모듈의 `get_objects` 메소드를 사용하면 현재 생성된 오브젝트를 확인할 수 있다.

  ```python
  import gc

  import waste_memory
  x = waste_memory.run

  found_objects = gc.get_objects()
  print('%d objects are allocated' % len(found_objects))  # 14873 objects are allocated
  print(repr(found_objects[0])[:100])  # <waste_memory.MyObject object at 0x1063f6940>
  ```

  하지만 해당 오브젝트가 어떻게 생성되었는지를 확인할 수는 없다.

- Python3의 `tracemalloc` 모듈을 사용하면 오브젝트가 어떻게 생성되었는지까지 확인할 수 있다.

  ```python
  # memory_profile.py
  import tracemalloc
  tracemalloc.start(10)  # Save up to 10 stack frames

  time1 = tracemalloc.take_snapshot()
  import waste_memory
  x = waste_memory.run()
  time2 = tracemalloc.take_snapshot()

  stats = time2.compare_to(time1, 'lineno')
  print(stats[0]). # waste_memory.py:6: size=2235KiB (+2235KiB), count=29981 (+29981)

  stats = time2.compare_to(time1, 'traceback')
  print('\n'.join(stats[0].traceback.format()))
  ## 출력
  # File "waste_memory.py", line 6
  #   self.x = os.urandom(100)
  # File "waste_memory.py", line 12
  #   obj = MyObject()
  # File "waste_memory.py", line 19
  #   deep_values.append(get_data())
  # File "memory_profile.py", line 7
  #   x = waste_memory.run()
  ```

- Python2에서는 `heapy`와 같은 외부 모듈을 사용해야한다. `tracemalloc`과 완전히 같지는 않다.
