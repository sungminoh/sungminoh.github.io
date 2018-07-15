---
layout: post
title:  "Effective Python 번역 요약"
tags: python
img: effective-python.jpg
---



## Chapter 1. Pythonic Thinking

### 1. Know Which Version of Python You're Using

python 3 써라



### 2. Follow the PEP 8 Style Guide

- tab 보단 4 spaces
- 한줄은 79 이하
- 여러줄에 걸쳐진 표현식의 둘째 줄 부터는 4 space 들여쓰기
- 함수, 클래스는 2줄 띄어쓰기
- 클래스 내 메소드는 한줄 띄어쓰기
- 배열 인덱스나, 함수 호출, 아규먼트 등에 space 두지 말기
- 변수 선언시 띄어쓰기는 하나만
- functions, variables, and attributes: `lowercase_underscore`
- protected instance attributes: `_leading_underscore`
- Private instance attributes: `__double_leading_underscore`
- Classes, exceptions: `CapitalizedWord`
- module-level constants: `ALL_CAPS`
- instance methods에는 `self`가 첫 파라메터
- class methods에는 `cls`가 첫 파라메터
- `if not a is b` < `if a is not b`
- `if len(somelist) == 0`, `if somelist == []`, `if value == ''` < `if not something`, `if something`
- 싱글라인 `if`, `for`, `while`, `except` 쓰지 말고 나눠서
- `import`는 파일의 제일 위에
- `bar` 패키지 안에서 `foo`를 임포트할 때, 절대경로 명시. `import foo` < `from bar import foo`
- 상대경로를 써야 할때에도 명시. `import foo` < `from . import foo`
- 스탠다드 라이브러리, 써드파티, 커스텀 순서대로 알파벳 순으로 임포트



### 3. Know the Differences Between `bytes`, `str` and `unicode`

Python3:

- bytes: 8-bit 값
- str: unicode 문자

Python2:

- str: 8-bit 값
- unicode: unicode 문자

utf-8은 unicode 문자를 바이너리 데이터로 표현하는 방식 중 가장 대표적인 애다.
Python3 의 str, Python2의 unicode 인스턴스는 해당하는 바이너리 인코딩이 없다.
따라서 unicode 문자를 바이너리 데이터로 바꾸기 위해서는 `encode` 메소드를 써야 한다.
반대로 바이너리 데이터를 unicode 문자로 바꾸기 위해서는 `decode` 메소드를 써야 한다.

인코딩(디코딩)은 처음에 한번 제대로 해두고, 일관되게 unicode 타입(Python3: str, Python2: unicode)을 사용하라.

다음 함수들을 사용하라.

- Python3

```python
def to_str(bytes_or_str):
	if isinstance(bytes_or_str, bytes):
		value = bytes_or_str.decode('utf-8')
	else:
		value = bytes_or_str
	return value  # 항상 str

def to_bytes(bytes_or_str):
	if isinstance(bytes_or_str, str):
		value = bytes_or_str.encode('utf-8')
	else:
		value = bytes_or_str
	return value  # 항상 bytes
```

- Python2

```python
def to_unicode(unicode_or_str):
    if isinstance(unicode_or_str, str):
        value = unicode_or_str.decode('utf-8')
    else:
        value = unicode_or_str
    return value  # 항상 unicode

def to_str(unicode_or_str):
    if isinstance(unicode_or_str, unicode):
        value = unicode_or_str.encode('utf-8')
    else:
        value = unicode_or_str
    return value  # 항상 str
```

그런데 Python2에서는 unicode와 str의 비교, 병합 등의 연산이 가능하지만, Python3에서는 공백 문자열 마저도 완전히 다른걸로 취급한다.

파일을 열고 닫을때는 기본적으로 utf-8 인코딩을 사용하여 unicode문자를 다루므로, Python3에서 bytes를 다루고자 할때는  명시적으로 `rb`, `wb`를 파라메터를 사용해야한다.



### 4. Write Helper Functions Instead of Complex Expressions

```Python
my_values = {
	'red': ['5'],
	'green': [''],
	'blue': ['0']
}

# 1번 방법
red = int(my_values.get('red', [''])[0] or 0)

# 2번 방법
red = my_values.get('red', [''])
red = int(red[0]) if red[0] else 0

# helper 함수를 사용하는 방법
def get_first_int(values, key, default=0):
    found = values.get(key, [''])
    if found[0]:
        found = int(found[0])
    else:
        found = default
    return default
red = get_first_int(my_values, 'red')
```

- 1, 2번 읽기 어렵다. 반복해서 쓸 일이 있으면 3번 방법 써라.
- `if/else`가 `or/and` 등 보다 읽기 좋다.



### 5. Know How to Slice Sequences

- 0번부터 또는 마지막까지 자르는 경우, 생략하라. `arr[0:len(arr)]` < `arr[:]`

- 음수 인덱스도 적절히 활용하라. ex) `arr[-20:]`

- slice를 할당하면 새로운 인스턴스를 생성하고, slice에 할당하면 메모리 값을 바꾼다.

  ```Python
  a = [1, 2, 3, 4, 5, 6]

  b = a[-3:]
  b[1] = -1  # a[4]의 값을 바꾸지 않는다. 새로운 list가 b에 할당된다.
  print a  # [1, 2, 3, 4, 5, 6]
  print b  # [4, -1, 6]

  a[1:4] = [10, 20]  # a의 값을 바꾼다.
  print a  # [1, 10, 20, 5, 6]

  b = a[:]  # slice를 사용해 할당하면 새로운 list를 만든다.
  assert b == a and b is not a  # 내용은 같지만 다른 인스턴스이다.

  b = a  # 반면 변수 자체를 할당하면 메모리를 공유한다.
  a[:] = [10, 20]
  assert a is b # 같은 인스턴스이다.
  print b  # [10, 20] 값도 바뀐다.
  ```



### 6. Avoid Using `start`, `end`, and `stride` in a Single Slice

```Python
w = '가나다라'
x = w.encode('utf-8')  # unicode 문자를 8-bit 값으로 바꾸고
y = x[::-1]  # stride로 reverse 하면
z = y.decode('utf-8')  # UnicodeDecodeError: 'utf-8' codec can't not decode byte ...
```

- start, end, stride 한번에 다 쓰면 너무 복잡하다.
- stride는 따로 쓰고, 가능한 양수만 쓴다.
- 만약 정말 세 파라메터 모두 써야 한다면 slice와 stride를 나눠서 따로 하라. 아니면 `itertools`의 `islice`를 쓰라.



### 7. Use List Comprehensions Instead of `map` and `filter`

- list 표현은 `map`과 `filter`기능을 동시에 수행하면서 `lambda`가 필요없다.
- dictionary, set 에도 사용가능하다.



### 8. Avoid More Than Two Expressions in List Comprehensions

- 복잡한 중첩은 피하라.

  ```Python
  [x for sublist1 in mylist for sublist2 in sublist1 for x in sublist2]
  # 보다는,
  flat = []
  for sublist1 in mylist:
      for sublist2 in sublist1:
          flat.extend(sublist2)
  # 과 같이 하라.
  ```



### 9. Consider Generator Expressions for Large Comprehensions

- list comprehension은 메모리를 많이 사용한다. generator를 써라.

  ```Python
  value = [len(line) for line in open('./file.txt')]
  # 보다는,
  it = (len(line) for line in open('./file.txt'))
  # 를 써라.
  ```

- 중첩도 된다.



### 10. Prefer `enumerate` Over range

- `range`로 index를 순회하기보다는 `enumerate`를 써라.

- 둘째 파라메터를 주면 시작 지점을 설정할 수 있다.

  ```Python
  for i in range(3, len(l)):
      v = l[i]
      print('l[%d]: %s' % (i+1, v))
  # 보다는
  for i, v in enumerate(l, 3):
      print('l[%d]: %s' % (i+1, v))
  # 를 써라.
  ```



### 11. Use `zip` to Process Iterators in Parallel

- Python3의 `zip`은 generator지만, Python2는 아니다. `itertools`의 `izip`을 사용하라.

- 여러 반복을 한번에 처리할 수 있다.

  ```python
  longest_name = None
  max_length = 0

  names = ['sungmin', 'james', 'peter']
  letters = [len(n) for n in names]
  for name, length in zip(names, letters):
      if length > max_length:
          longest_name = name
          max_length = length
  ```

- 길이가 다르면 짧은 쪽에 맞춘다.

  ```python
  names.append('john')
  for name, length in zip(names, letters):
      print(name)
  # sungmin, james, peter
  ```

- Python3 에서는 `itertools`의 `zip_longest`를 쓰면 긴쪽에 맞출 수 있다. 짧은 쪽은 `None`으로 채워진다.



### 12. Avoid `else` Blocks After `for` and `while` Loops

- loop문 뒤에 `else`는 `break`되지 않고 끝났을 때 수행된다.

- 헷갈리니까 왠만하면 쓰지 마라.

  ```python
  a = 4
  b = 9
  for i in range(2, min(a, b) + 1):
      if a % i == 0 and b % i == 0:
          print('Not coprime')
          break
  else:
      print('Coprime')
  # 보다는,
  def coprime(a, b):
      for i in range(2, min(a, b) + 1):
          if a % i == 0 and b % i == 0:
              return False
      return True
  # 또는,
  def coprime2(a, b):
      is_coprime = True
      for i in range(2, min(a, b) + 1):
          if a % i == 0 and b % i == 0:
              is_coprime = False
              break;
      return is_coprime
  # 처럼 하라.
  ```



### 13. Take Advantage of Each Block in `try/except/else/finally`

- 각각을 적절히 활용하는 예제 코드

```python
UNDEFINED = object()

def divide_json(path):
    handle = open(path, 'r+')   # IOError가 날 수 있다.
    try:
        data = handle.read()    # UnicodeDecodeError가 날 수 있다.
        op = json.loads(data)   # ValueError가 날 수 있다.
        value = (
            op['numerator'] /
            op['denominator'])  # ZeroDivisionError가 날 수 있다.
    except ZeroDivisionError as e:
        return UNDEFINED
    else:
        op['result'] = value
        result = json.dumps(op)
        handle.seek(0)
        handle.write(result)    # IOError가 날 수 있다.
        return value
    finally:
        handle.close()          # 항상 수행된다.
```

- `try`는 예외 잡을 때, `except`는 예외처리, `else`는 성공 시, `finally`는 마지막에 수행된다.



<br/>
-----
<br/>


## Chapter 2. Functions

### 14. Prefer Exceptions to Returning None

- `None`을 리턴하고 `if not result`과 같은 식으로 확인하면, 리턴값이 `0, [], ''` 등일 때 잘못될 수 있다.

  ```python
  def divide(a, b):
      try:
          return a / b
      except ZeroDivisionError:
          return None

  x, y = 0, 5
  result = devide(x, y)
  if not result:               # result = 0
      print('Invalid inputs')  # 잘못되었다.

  # 성공 실패를 같이 반환할 수도 있지만,
  def divide2(a, b):
      try:
          return True, a / b
      except ZeroDivisionError:
          return False, None
  # 보기도 불편하고
  _, result = divide(x, y)
  # 이렇게 무시할 가능성이 높다.

  # 이럴 땐, 인풋이 적절치 않다는 ValueError를 내라.
  def divide3(a, b):
      try:
          return a / b
      except ZeroDivisionError as e:
          raise ValueError('Invalid inputs') from e
  # 그러면,
  try:
      result = divide(x, y)
  except ValueError:
      print('Invalid inputs')
  else:
      print('Result is %.1f' % result)
  # 이렇게 경우에 따라 처리할 수 있다.
  ```



### 15. Know How Closures Interact with Variable Scope

다음 함수가 잘 동작할까?

```python
def sort_priority(numbers, group):
    '''group에 속한 숫자들끼리 비교해서 앞에 두고, 나머지를 비교한다.'''
    found = False
    def helper(x):
        if x in group:
            found = True
            return (0, x)
        return (1, x)
    numbers.sort(key=helper)
    return found

numbers = [8, 3, 1, 2, 5, 4, 7, 8]
group = {2, 3, 5, 7}
found = sort_priority(numbers, group)
print('Found: ', found)  # Found: False <- 잘못되었다.
print(numbers)           # [2, 3, 5, 7, 1, 4, 6, 8]
```

- 함수는 바깥 스코프에서 선언된 변수를 쓸 수 있다.
- 함수는 _first_class_ 오브젝트이다. 변수에 할당가능하고, 비교할 수 있으며, 파라메터로 넘길 수 있다.
- tuple을 대소 비교할 때에는 앞에 것부터 순서대로 비교한다.
- 변수를 사용하고자 할 때, 그 값을 찾는 스코프 순서는 다음과 같다. 모두 없으면 `NameError`가 난다.
  - 현재 함수 스코프
  - 그 바깥 함수 스코프
  - 모듈 스코프 (= 글로벌 스코프)
  - built-in  스코프 (len, str 등의 함수를 포함)
- 변수에 값을 할당할 때, 현재 스코프에 있으면 값을 바꾸고, 없으면 바깥 스코프를 사용하지 않고 새로 메모리에 올린다.

*어떻게 함수 내에서 바깥 스코프의 변수를 바꿀 수 있을까.*

```python
# Python3
def sort_priority2(numbers, group):
    '''group에 속한 숫자들끼리 비교해서 앞에 두고, 나머지를 비교한다.'''
    found = False
    def helper(x):
        nonlocal found
        if x in group:
            found = True
            return (0, x)
        return (1, x)
    numbers.sort(key=helper)
    return found

# Python2
def sort_priority3(numbers, group):
    '''group에 속한 숫자들끼리 비교해서 앞에 두고, 나머지를 비교한다.'''
    found = [False]
    def helper(x):
        if x in group:
            found[0] = True
            return (0, x)
        return (1, x)
    numbers.sort(key=helper)
    return found[0]
```

- `global <변수명>` 을 명시하면 모듈 스코프에서 변수를 찾는다.

- Python3에는 `nonlocal <변수명>`이 있어, 바깥 함수 스코프로 제한할 수도 있다.

- Python2에는 애초에 변수를 mutable한 list 등으로 선언하고 내부에서는 `found[0] = True`와 같이 바꾼다.

- 하지만 함수가 길어지면 헷갈릴 수 있기 때문에, 복잡한 함수는 다음과 같이 별도의 helper 클래스로 만드는 것이 읽기 좋다.

  ```python
  class Sorter(object):
      def __init__(self, group):
          self.group = group
          self.found = False

      def __call__(self, x):
          if x in self.group:
              self.cound = True
              return (0, x)
          return (1, x)

  sorter = Sorter(group)
  numbers.sort(key=sorter)
  assert sorter.found is True
  ```



### 16. Consider Generators Instead of Returning Lists

- `ret = []`를 선언 한 후 `ret.append(x)`를 반복하고 나중에 `return ret`하는 것보다, 바로 `yield`하는 generator로 구성하는게 읽기에도 좋고, 메모리관리에도 좋다.
- 사용자는 반드시 generator의 특성들(인덱스 참조 가 안되고 재사용 안되는 등)을 인지해야한다.



### 17. Be Defensive When Iterating Over Arguments

함수 내에서 인풋을 여러번 순회할 때는 타입을 신경써야한다.

다음 함수는 어떤 종류의 파라메터만 받을 수 있는가?

```python
def normalize(numbers):
    '''전체 리스트에서 각 값의 비율을 계산한다'''
    total = sum(numbers)
    result = []
    for value in numbers:
        percent = 100 * value / total
        result.append(percent)
    return result
```

만약 list가 아니라 iterator가 들어가게 되면, `sum(numbers)`에서 다 사용되고, `for`문은 더 이상 돌지 않는다.

함수 앞에 `numbers = list(numbers)`를 추가하여, iterator를 list로 만들어 복사하거나, 아에 generator를 인자로 넘긴다.

```python
def normalize_copy(numbers):
    '''전체 리스트에서 각 값의 비율을 계산한다'''
    numbers = list(numbers)  # iterator의 값 복사
    total = sum(numbers)
    result = []
    for value in numbers:
        percent = 100 * value / total
        result.append(percent)
    return result

def normalize_func(get_iter):
    '''전체 리스트에서 각 값의 비율을 계산한다'''
    total = sum(get_iter())
    result = []
    for value in get_iter():
        percent = 100 * value / total
        result.append(percent)
    return result

percentages = normalize_func(lambda: read_file(path))
```

- `for`는 사실 `iter(foo)`이다. `iter`함수는 `foo.__iter__`를 호출하는데, 이는 `__next__`메소드를 가진 iterator 오브젝트를 반환한다. `for`루프는 `StopIteration`이 날 때까지 `next(<iterator>)`를 수행한다.

- `__iter__`메소드를 generator로 오버라이드한 클래스를 만들어, 매번 iterator를 생성할 수 있다.

  ```python
  class ReadFile(object):
      def __init__(self, path):
          self.path = path

      def __iter__(self):
          with open(self.path) as f:
              for line in f:
                  yield int(line)

  numbers = ReadFile(path)
  percentages = normalize(numbers)
  ```

- `iter` 함수는 인자가 interator일 경우에는 그 자체를, container인 경우에는 iterator를 만들어 반환한다. 이를 이용해 인풋의 타입을 체크할 수 있다.

  ```python
  def normalize_defensive(numbers):
      if iter(numbers) is iter(numbers)  # numbers가 iterator가 아니라면 False
      	raise TypeError('Must supply a container')
      total = sum(numbers)
      result = []
      for value in numbers:
          percent = 100 * value / total
          result.append(percent)
      return result

  numbers = [15, 35, 80]
  normalize_defensive(numbers)  # No Error
  numbers = ReadFile(path)
  normalize_defensive(numbers)  # No Error
  ```

  ​

### 18. Reduce Visual Noise with Variable Positional Arguments

- `*args`를 이용해서 0 - n개의 인자를 받도록 할 수 있다.
- `*args`는 인풋들을 `tuple`로 묶는다. 따라서 generator를 넘기게 되면, 이를 모두 메모리에 올리게 된다.
  그러므로 들어오는 인풋의 개수가 적을때에만 사용하도록 한다.
- `*args` 뒤에 다른 인풋을 받도록 선언할 수 없다.
- 파라메터가 꼬이는 경우가 쉽게 생기기 떄문에, keyword-only argument를 사용하는 것도 좋다.



### 19. Provide Optional Behavior with Keyword Arguments

```python
def remainder(number, divisor):
    return number % divisor

remainder(20, 7)
remainder(20, divisor=7)
remainder(number=20, divisor=7)
remainder(divisor=7, number=20)
```

- 파라메터의 이름과 함께 주어지는 인자를 *keyword argument*라 하고, 위치에 맞게 주어지는 인자를 *positional argument*라 한다.
- positional argument는 keyword argument 앞에 와야한다.
- keyword argument를 사용하면 가독성이 좋다.

```python
def flow_rate(weight_diff, time_diff, period=1, units_per_kg=1):
    return ((weight_diff / units_per_kg) / time_diff) * period

flow_rate(weight_diff, time_diff, 3600, 2.2)  # 헷갈린다.
flow_rate(weight_diff, time_diff, period=3600, units_per_kg=2.2)  # 이렇게 쓰라.
```

- 함수를 선언할 때 keyword 파라메터를 여러개 둘 수 있다. positional argument로도 동작하지만 keyword를 명시하라.



### 20. Use `None` and Docstrings to Specify Dynamic Default Arguments

- keyword argument의 기본값으로 주어진 함수는 모듈이 로드될 때 한번만 수행되므로 동적인 값을 주지 않는다.
  동적인 기본값이 필요할 때에는 `None`을 기본값으로 주고 그 동작을 docstring으로 설명하라.

  ```python
  def log(message, when=datetime.now()):
      print('%s: %s' % (when, message))

  # 이 함수는 datetime.now()가 한번 실행되어 바인딩 되므로, 동적인 값을 줄 수 없다.
  log('Hi there!')  # 2014-11-15 21:10:10.371432: Hi there!
  sleep(0.1)
  log('Hi again!')  # 2014-11-15 21:10:10.371432: Hi again!

  def log_dynamic(message, when=None):
      ''' Log a message with a timestamp.

      Args:
      	message: Message to print.
      	when: datetime of when the message occured.
      		Defaults to the present time.
      '''
      when = datetime.now() if when is None else when
      print('%s: %s' % (when, message))

  # 이 함수는 제대로 동작한다.
  ```

- 함수 뿐 아니라 call by reference인 오브젝트도 문제다. 기본값으로 주어진 오브젝트는 모듈 로드 때 한번만 메모리에 올라간다.

  ```python
  def decode(data, default={}):
      try:
          return json.loads(data)
      except ValueError:
          return default

  foo = decode('bad data')
  foo['stuff'] = 5
  bar = decode('also bad')
  bar['mepp'] = 1
  # foo와 bar는 같은 dictionary 오브젝트를 공유한다.
  print('foo: ', foo)  # foo: {'stuff': 5, 'meep': 1}
  print('bar: ', bar)  # bar: {'stuff': 5, 'meep': 1}
  ```



### 21. Enforce Clarify with Keyword-Only Arguments

- keyword argument를 써서 함수를 정의했다 하더라도 positional argument처럼 호출할 수 있기때문에 헷갈릴 수 있다.

- Python3 에서는 `*`를 positional argument와 keyword argument사이에 두어 keyword argument를 강제한다.

  ```python
  def safe_division(number, divisor, *,
                    ignore_overflow=False,
                    ignore_zero_division=False):
      try:
          return number / divisor
      except OverflowError:
          if ignore_overflow:
              return 0
          else:
              raise
      except ZeroDivisionError:
          if ignore_zero_division:
              return float('int')
          else:
              raise

  safe_division(1, 10*500, True, False)
  # TypeError: safe_division() takes 2 positional arguments
  ```

- Python2에서는 그런 기능이 없기 때문에 `**` arguments를 활용하고, 잘못된 인풋에는 `TypeError`를 낸다.

  ```python
  def safe_division(number, divisor, **kwargs):
      ignore_overflow = kwargs.pop('ignore_overflow', False)
      ignore_zero_division = kwargs.pop('ignore_zero_division', False)
      if kwargs:  # pop으로 값을 뽑아내고, 비어있는지 체크해서 파라메터가 잘못되었는지 확인한다.
          raise TypeError('Unexpected **kwargs: %r' % kwargs)
      # ...
  ```


<br/>
-----
<br/>

## Chapter 3. Classes and Inheritance

### 22. Prefer Helper Classes Over Bookkeeping with Dictionary and Tuples

- dictionary의 값으로 dictionary나 긴 tuple이 들어가는 것을 지양하라.
- tuple은 요구사항에 따라 길어질 수 있다. 가벼운 immutable한 데이터 컨테이너가 필요할 때, `collections`의 `namedtuple`을 사용하면 이름으로 관리할 수 있고, 나중에 class로의 확장도 쉽다.
  - 하지만 기본값을 설정할 수 없다. class를 이용하는게 더 나을 수 있다.
  - 여전히 인덱스와 순회로 값에 접근할 수 있어, 의도치 않은 오작동을 일으킬 수 있다.

```python
class WeightedGradeBook(object):
    def __init__(self):
        self._grades = {}

    def add_student(self, name):
        self._grades[name] = {}

    def report_grade(self, name, subject, score, weight):
        by_subject = self._grades[name]
        grade_list = by_subject.setdefault(subject, [])
        grade_list.append((score, weight))

    def average_grade(self, name):
        by_subject = self._grades[name]
        score_sum, score_count = 0, 0
        for subject, scores in by_subject.items():
            subject_avg, total_weight = 0, 0
            for score, weight in scores:
                subject_avg += score * weight
                total_weight += weight
            score_sum += subject_avg / total_weight
            score_count += 1
        return score_sum / score_count

# 만약 여기에서 note라는 변수가 추가되어 (score, weight, note)가 되면 수정하기 복잡하다.

from collections import namedtuple
Grade = namedtuple('Grade', ('score', 'weight'))

class Subject(object):
    def __init__(self):
        self._grades = []

    def report_grade(self, score, weight):
        self._grades.append(Grade(score, weight))

    def average_grade(self):
        total, total_weight = 0, 0
        for grade in self._grades:
            total += grade.score * grade.weight
            total_weight += grade.weight
        return total / total_weight


class Student(object):
    def __init__(self):
        self._subjects = {}

    def subject(self, name):
        if name not in self._subjects:
            self._subjects[name] = Subject()
        return self._subjects[name]

    def average_grade(self):
        total, count = 0, 0
        for subject in self._subjects.values():
            total += subject.average_grade()
            count += 1
        return total / count


class GradeBook(object):
    def __init__(self):
        self._students = {}

    def student(self, name):
        if name not in self._students:
            self._students[name] = Student()
        return self._students[anme]


# 이처럼 길더라도 여러개의 helper class를 이용하는 것이 더 깔끔하다.

book = GradeBook()
albert = book.student('Albert Einstein')
math = albert.subject('student')
math.report_grade(80, 0.10)
print(albert.average_grade)  # 123
```



### 23. Accept Functions for Simple Interfaces Instead of Classes

- defaultdict를 쓰는데, 없는 키의 카운트를 세고 싶다. stateful hook을 위해서는 helper 함수로 closure를 정의하라.

  ```python
  def increment_with_report(current, increments):
      added_count = 0  # 없는 키를 세기 위한 state

      def missing():   # defaultdict의 hook. 키가 없을때 호출되며, state를 바꾼다.
          nonlocal added_count
          added_count += 1
          return 0

      result = defaultdict(missing, current)
      for key, amount in increments:
          result[key] += amount

      return result, added_count
  ```

  result, count = increment_with_report(current, increments)

```
- 하지만 이런 예는 stateless 함수보다 읽기 어렵다. state를 감싼 작은 class는, stateful closure의 동작을 더 깔끔하게 보여준다. `__call__` 메소드를 구현하여 인스턴스 자체를 hook으로 쓴다.

  ```python
  class CountMissing(object):
      def __int__(self):
  		self.added = 0

      def __call__(self):
          self.added += 1
          return 0


  counter = CountMissing()
  result = defaultdict(counter, current)

  for key, amount in increments:
      result[key] += amount
```

- 간단한 interface와 같은 함수도 있다. (eg. hook을 받는 defaultdict)
- Python의 함수나 메소드는 first class이다. 즉 다른 표현에 사용되거나 변수로 쓰일 수 있다.
- `__call__` 메소드는 인스턴스를 함수처럼 쓸 수 있게 한다.
  상태를 유지하는 함수가 필요할 때에는 stateful closure를 정의하기보단 `__call__`을 구현한 클래스를 만들자.



### 24. Use `@classmethod` Polymorphism to Construct Objects Generically

Python에서는 오브젝트 뿐 아니라 클래스도 다형성을 지원한다. 다형성은 계층관계의 클래스들이 각자 별도의 메소드를 가질 수 있는 것을 뜻한다. 이로 인해, 공통된 interface나 abstract base class를 가지고 여러 기능을 수행하는 클래스를 만들 수 있다.

여러 데이터 소스의 라인 수의 총 합을 세어주는 MapReduce를 구현한다고 해보자.
인터페이스가 되는 `InputData`클래스가 필요하고, 데이터 소스의 종류별로 `read` 메소드를 오버라이드한 subclass들을 구현한다. 마찬가지로 `map`과 `reduce`함수를 가진 `Worker`추상 클래스가 필요하고, 이를 상속하여 필요한 작업에 맞게 오버라이드한 subclass들을 구현한다.

```python
class InputData(object):
    '''input data는 이 class를 상속하여 read 메소드를 구현한다.'''
    def read(self):
        raise NotImplementedError


class PathInputData(InputData):
    '''file을 열어 읽는 subclass이다.'''
    def __init__(self, path):
        super().__init__()  # Python2에서는 super(PathInputData, self).__init__()
        self.path = path

    def read(self):
        return open(self.path).read()

# 이와 비슷하게 network, decompress 등으로부터 데이터를 읽는 subclass를 만들 수 있다.


class Worker(object):
    '''MapReduce 작업을 수행하는 워커 클래스이다. 작업에 따라 subclass를 구현한다.'''
    def __init__(self, input_data):
        self.input_data = input_data
        self.result = None

    def map(self):
        raise NotImplementedError

    def reduce(self, other):
        raise NotImplementedError


class LineCounterWorker(Worker):
    '''데이터 소스의 라인 수를 세어주는 워커 클래스이다.'''
    def map(self):
        data = self.input_data.read()
        self.result = data.count('\n')

    def reduce(self, other):
        self.result += other.result

# 다른 종류의 작업을 하는 subclass를 만들 수 있다.
```

여러개의 `Worker`가 여러개의 `InputData`를 멀티쓰레드로 처리하게 한 후, `Worker.reduce`로 결과를 종합하고 싶다. 이를 관리하기 위해 각 오브젝트를 연결해 주는 다음과 같은 helper 함수가 필요하다.

```python
def generate_inputs(data_dir):
    '''data_dir하위의 파일들에 대해 각각 PathInputData 오브젝트를 만든다.'''
    for name in os.listdir(data_dir):
        yield PathInputData(os.path.join(data_dir, name))


def create_workers(input_list):
    '''각각의 InputData 오브젝트에 대해, LineCountWorker를 만든다.'''
    workers = []
    for input_data in input_list:
        workers.append(LineCountWorker(input_data))
    return workers


def execute(workers):
    '''멀티쓰레드를 이용하여 각 Worker들의 map 메소드를 수행하고,
    첫번째 Worker를 기준으로 reduce하여 최종 값을 구한다.'''
    threads = [Thread(target=w.map) for w in workers]
    for thread in threads: thread.start()
    for thread in threads: thread.join()
    first, rest = workers[0], workers[1:]
    for worker in rest:
        first.reduce(worker)
    return first.result


def mapreduce(data_dir):
    inputs = generate_inputs(data_dir)
    workers = create_workers(inputs)
    return execute(workers)
```

하지만 문제가 있다. 이와 같은 `generate_inputs`, `create_workers`, `mapreduce` 함수는 내부에서 `PathInputData`, `LineCountWorker`를 사용하기 때문에 generic하지 못하다. 때문에, 다른 `InputData`, `Worker`를 위해서는 사용될 수 없다.

다른 언어에서는 생성자의 다형성을 이용해 generic한 오브젝트 생성을 하지만, Python에는 `__init__`이라는 하나의 생성자만 지원한다.

이러한 문제는 `@classmethod`다형성을 이용해 해결할 수 있다. 이 데코레이션이 달린 메소드는 생성된 오브젝트만이 아니라, 전체 클래스에 영향을 미친다.

```Python
class GenericInputData(object):
    def read(self):
        raise NotImplementedError

    @classmethod
    def generate_inputs(cls, config):
        raise NotImplementedError


class PathInputData(GenericInputData):
	# ...
    @classmethod
    def generate_inputs(cls, config):
        data_dir = config['data_dir']
        for name in os.list(data_dir):
            yield cls(os.path.join(data_dir, name))


class GenericWorker(object):
    # ...
    def map(self):
        raise NotImplementedError

    def reduce(self):
        raise NotImplementedError

    @classmethod
    def create_workers(cls, input_class, config):
        workers = []
        for input_data in input_class.generate_inputs(config):
            workers.append(cls(input_data))  # __init__을 바로 사용하지 않고 cls를 이용한다.
        return workers


class LineCountWorker(GenericWorker):
    # ...
```

`create_workers`메소드는 `input_class`라는 인자를 받고, `input_class.generate_inputs`메소드를 호출하여 `GenericInputData`의 subclass를 생성한다. 즉 `PathInputData`가 인자로 들어오든 다른 subclass가 인자로 들어오든 상관없이 적절한 인스턴스를 생성하고, 이를 이용해 `Worker`인스턴스를 생성한다.

이제 `mapreduce` 함수는 다음과 같이 generic하게 된다.

```python
def mapreduce(worker_class, input_class, config):
    workers = worker_class.create_workers(input_class, config)
    return execute(workers)


# 다음과 같이 사용할 수 있다.
from tempfile import TemporaryDirectory

def write_test_files(tmpdir):
    # ...

with TemporaryDirectory() as tmpdir:
    write_test_files(tmpdir)
    config = {'data_dir': tmpdir}
    result = mapreduce(LineCountWorer, PathInputData, config)
```

- Python 은 `__init__`이라는 하나의 생성자만 지원한다.
- 하지만 `@classmethod`를 이용하면 대용할 수 있는 생성자를 만들 수 있다.
- subclass를 생성하고 관리하는 generic한 방법이 필요할 땐, class method 다형성을 이용하라.



### 25. Initialize Parent Classes with `super`

다이아몬트 형태의 상속관계를 생각해보자. 슈퍼클래스가 있고, 이를 상속한 두개의 서브클래스가 있고, 이 두 서브클래스를 모두 상속하는 최종 클래스가 있다고 하자.

생성자를 다음과 같이 작성하면 어떻게 될까.

```python
class First(object):
    def __init__(self):
        print 1


class Second(First):
    def __init__(self):
        First.__init__(self)
        print 2


class Third(First):
    def __init__(self):
        First.__init__(self)
        print 3


class Fourth(Second, Third):
    def __init__(self):
        Second.__init__(self)
        Third.__init__(self)


Fourth()  # 1, 2, 1, 3 순서대로 출력된다.
```

즉, 최종 클래스의 생성자에서 호출하는 순서대로 부모 클래스의 생성자가 호출되는데, 부모 클래스들이 또 다시 부모 클래스를 공유할 경우, 최상위 클래스의 생성자는 여러번 불리게 된다.

최상위 클래스는 값을 할당하고 그 하위 클래스들은 값을 바꾸는 동작을 한다면, 이는 잘못된 결과를 낳을 수 있다. 값 할당 → 변경 → 변경 순서로 동작해야 하는데, 값할당 → 변경 → 값할당 → 변경 순서로 동작하기 때문이다.

이런 문제를 방지하기 위해 MRO(method resolution Order)를 정의하는 `super`라는 메소드가 있다. 이는 어떤 순서로 초기화 함수를 수행할지를 표준화하고. 각 생성자는 중복 없이 한번만 실행된다.

```python
# Python2
class Second(First):
    def __init__(self):
        super(Second, self).__init__()
        print 2


class Third(First):
    def __init__(self):
        super(Third, self).__init__()
        print 3


class Fourth(Second, Third):
    def __init__(self):
        super(Fourth, self).__init__()
        print 4


from pprint import pprint

pprint(Fourth.mro())
'''
[<class '__main__.Fourth'>,
 <class '__main__.Second'>,
 <class '__main__.Third'>,
 <class '__main__.First'>,
 <type 'object'>]
'''

Fourth()  # 1, 3, 2, 4 순서대로 출력된다.

'''
Python3
__class__라는 변수가 있어서 supser(__class__, self)로 쓸수 있다.
더 간단하게는 super()라고만 해도된다.
클래스명을 쓰지 않기 때문에, 클래스명 변경에 더 자유롭다.
'''
```

- 상속관계가 있을 때엔 `super(<class name>, self).__init__()`으로 부모의 생성자를 호출한다.
- 부모 클래스가 여러개인 경우, 나중에 주어진 클래스부터, 가장 최상위 클래스부터 초기화된다.
  즉 먼저 주어졌을수록, 최하위 일수록 우선순위를 가진다. (값을 오버라이드함)



### 26. Use Multiple Inheritance Only for Mix-in Utility Classes

- 다중 상속이 가능하지만, 왠만하면 하나만 상속하라. 만약 다중 상속을 해야 한다면, *mix-in* 클래스를 써라.
- mix-in 클래스는 추가적인 메소드를 정의한다.
- 하지만 추가적인 인스턴스 어트리뷰트를 정의하지 않는다.
- 뿐만 아니라 `__init__`생성자가 호출될 일이 없다.

클래스를 serializable한 dictionary로 만드는 함수를 generic하게 작석하고 싶다면 아래와 같이 할 수 있다.

```python
class ToDictMixin(object):
    def to_dict(self):
        return self._traverse(None, self.__dict__)

    def _traverse(self, key, value):  # key 파라메터는 필요없어 보이겠지만 ...
        if isinstance(value, ToDictMixin):
            return value.to_dict()
        elif isinstance(value, dict):
            return {k: self._traverse(k, v) for k, v in value.items()}
        elif isinstance(value, list):
            return [self._traverse(key, v) for v in value]
        elif hasattr(value, '__dict__'):
            return self._traverse(key, value.__dict__)
        else:
            return value
```

이 클래스를 상속한 클래스는 `to_dict`메소드를 호출 할 수 있다. 이 메소드는 재귀적으로 동작한다. 따라서 싸이클이 있는 경우에는 무한루프에 빠질 수 있다. 따라서 다음과 같이 무한루프에 빠지는 케이스를 따로 처리하도록 오버라이드한다.

```python
class BinaryTree(ToDictMixin):
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


class BinaryTreeWithParent(BinaryTree):
    def __init__(self, value, left=None, right=None, parent=None):
        super().__init__(value, left, right)
        self.parent = parent  # 이 어트리뷰트 때문에 cycle이 생기고, to_dict는 무한루프에 빠진다.

    def _traverse(self, key, value):  # 이렇게 오버라이드 해서 무한루프를 방지한다.
        if isinstance(value, BinaryTreeWithParent) and key == 'parent':  # 키는 여기서 쓴다.
            return value.value  # parent는 _traverse로 순회하지 않고, 값만 반환한다.
        else:
            return super()._traverse(key, value)

root = BinaryTreeWithParent(10)
root.left = BinaryTreeWithParent(7, parent=root)
root.left.right = BinaryTreeWithParent(9, parent=root.left)
print(root.to_dict())
```

다른 mix-in클래스도 필요할 수 있다. 오브젝트를 json으로 만들고, json으로 오브젝트를 만드는 mix-in클래스를 구현해보자.

```python
class JsonMixin(object):
    @classmethod
    def from_json(cls, data):
        kwargs = json.loads(data)
        return cls(**kwargs)

    def to_json(self):
        return json.dumps(self.to_dict())
```

이 클래스는 `ToDictMixin.to_dict` 메소드를 사용한다. 따라서 `JsonMixin`클래스는 `ToDictMixin`클래스를 상속한 클래스에서만 제대로 동작할 것이다.

```python
class DatacenterRack(ToDictMixin, JsonMixin):
    def __init__(self, switch=None, machines=None):
        self.switch = Switch(**switch)
        self.machines = [Machine(**kwargs) for kwargs in machines]


class Switch(ToDictMixin, JsonMixin):
    def __init__(self, ports, speed):
        self.ports = ports
        self.speed = speed


class Machine(ToDictMixin, JsonMixin):
    def __init__(self, cores, ram, disk):
        self.cores = cores
        self.ram = ram
        self.disk = disk


serialized = '''{
    "switch": {"ports": 5, "speed": 1e9},
    "machines": [
        {"cores": 8, "ram": 32e9, "disk": 5e12},
        {"cores": 4, "ram": 16e9, "disk": 1e12},
        {"cores": 2, "ram": 4e9, "disk": 500e12}
    ]
}'''

deserialized = DatacenterRack.from_json(serialized)  # json 스트링을 오브젝트로 만든다.
roundtrip = deserialized.to_json()  # 오브젝트를 json 스트링으로 만든다.
assert json.loads(serialized) == json.loads(roundtrip)
```

- mix-in 클래스의 메소드를 오버라이드할 수 있다.
- 여러 mix-in 클래스들을 함께 사용할 수 있다.



### 27. Prefer Public Attributes Over Private Ones

- `__private_field`는 내부적으로 `_MyClass__private_field`로 저장된다.
  따라서 `self.__private_field`는 내부적으로 `self._MyClass__private_field`로 동작한다.

  ```python
  print(child_object.__dict__)  # {'_MyParentClass__private_field': 27}
  ```

- subclass는 클래스명이 다르므로 parent의 private 어트리뷰트에 접근하지 못한다.
  대신 `child_object._MyParentClass__private_field` 처럼 하면 접근이 가능하다.

- *"We are all consenting adults here."*. Python의 모토다. private이더라도 완전히 가려지지 않는다.

- 때문에 다른 개발자가 private을 쓸 수 있으며, 상속구조가 바뀌거나 하면 문제가 될 수 있다.

- 차라리 다큐먼트로 설명을 하고, `_protedted_field`를 쓰는게 낫다.

- 하지만 `_protedted_field`는 subclass에서 같은 이름을 쓰면 덮어쓰게 되므로 이에 유의해야한다.



### 28. Inherit from `collections.abc` for Custom Container Types

기존 자료구조를 이용하여 새로운 커스텀 클래스를 만들 수 있다.

```python
class FrequencyList(list):
    def __init__(self, numbers):
        super().__init__(numbers)

    def frequency(self):
        counts = {}
        for item in self:
            counts.setdefault(item, 0)
            counts[item] += 1
        return counts


foo = FrequencyList(['a', 'b', 'a', 'c', 'b', 'a', 'd'])
print(len(foo))         # 7
foo.pop()
print(repr(foo))        # ['a', 'b', 'a', 'c', 'b', 'a']
print(foo.frequency())  # {'a': 3, 'c': 1, 'b': 2}
```

좀 더 복잡하게, 커스텀 클래스를 기존 자료구조처럼 이용하고 싶은 경우를 생각해보자.

```python
class BinaryNode(object):
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


class IndexableNode(BinaryNode):
    def _search(self, count, index):
        found = None
        if self.left:
            found, count = self.left._search(count, index)
        if not found:
            if count == index:
                found = self
            else:
                count += 1
                if self.right:
                    found, count = self.right._search(count, index)
                else:
                    found = None
        return found, count

    def __getitem__(self, index):
        found, _ = self._search(0, index)
        if not found:
            raise IndexError('Index out of range')
        return found.value


tree = IndexableNode(
    10,
    left=IndexableNode(
        5,
        left=IndexableNode(2),
        right=IndexableNode(
            6,
            right=IndexableNode(7))),
    right=IndexableNode(
        15,
        left=IndexableNode(11)))

print(list(tree))  # [2, 5, 6, 7, 10, 11, 15]
print(tree[2])     # 6
print(11 in tree)  # True
print(4 in tree)   # False
```

- `__getitem__`을 구현하면, `[index]`로 접근할 수 있으며, `list`함수나 `in` 오퍼레이터도 쓸 수 있다.

하지만 진짜 `list` 클래스처럼 쓰려면 `__len__`도 구현해야하고, `count`나 `index` 메소드까지 쓰려면 일이 많다.
기본 컨테이너를 직접 구현하는건 쉬운 일이 아니다. 많은 메소드들을 다 구현해야하기 때문이다.

```python
class SequenceNode(IndexableNode):
    def __len__(self):  # 우선 len을 구현한다.
        _, count = self._search(0, None)
        return count
```

- `collections.abc`모듈은 각 컨테이너 타입에 맞는 메소드들을 미리 구현해 놓은 추상 클래스를 제공한다.

```python
from collections.abc import Sequence

class BadType(Sequence):
    pass

bad = BadType()
# Type Error: Can't instantiate abstract class BadType with abstract methods __getitem__, __len__

class BetterNode(SequenceNode, Sequence):  # __getitem__, __len__만 구현해서 넣으면,
    pass                                   # index, count는 자동으로 구현된다.
```

- `collections.abc`의 `Sequence`는 `__getitem__`, `__len__`만 구현하면 `index`, `count` 등의 디펜던시가 있는 다른 메소드는 자동으로 사용할 수 있다.
- 특별한 메소드를 더 많이 가진 타입인 `Set`이나 `MutableMapping`을 만들 때는 특히 더 유용하다.


<br/>
-----
<br/>


## Chapter 4. Metaclasses and Attributes

### 29. Use Plain Attributes Instead of Get and Set Methods

- getter와  setter를 두는것은 Pythoinc하지 않다.

- getter와 setter는 interface를 제공하고, 기능을 encapsulate하고, 사용의 한계를 정의하는 면에서 중요하지만, 파이썬에서는 쓰지 않고 그냥 private, public 어트리뷰트로 구현한다.

- 어트리뷰트의 값이 바뀌었을 때, 어떤 추가적인 동작을 하기 원한다면 `@property`와 `@<attribute>.setter`를 쓴다.

  ```python
  class Resistor(object):
      def __init__(self, ohms):
          self.ohms = ohms
          print('init voltage, ohms')
          self.voltage = 0  # 하위 클래스의 voltage.setter가 불린다.
          self.current = 0

  class VoltageResistance(Resistor):
      def __init__(self, ohms):
          super().__init__(ohms)
          print('init _voltage')
          self._voltage = 0  # super().__init()에서 이미 세팅되었기 때문에, 없어도 된다.

      @property
      def voltage(self):
          print('get voltage')
          return self._voltage

      @voltage.setter
      def voltage(self, voltage):
          print('set voltage')
          self._voltage = voltage
          # self.voltage, self._voltage 모두 없다가 이때 _voltage 어트리뷰트가 생긴다.
          self.current = voltage / self.ohms

  r = VoltageResistance(1e3)
  # init voltage, ohms
  # set voltage
  # init _voltage

  print(r.current)  # 0
  r.voltage = 10
  print(r.current)  # 0.01
  ```

- 새로 할당하려는 값의 유효성을 검사하거나, immutable하도록 제한하는데 쓸 수 도 있다.

  ```python
  class BoundedResistance(Resistor):
      def __init__(self, ohms):
          super().__init__(ohms)

      @property
      def ohms(self):
          return self._ohms

      @ohms.setter
      def ohms(self, ohms):
          if hasattr(self, '_ohms'):
              raise AttributeError("Can't set attribute")
          if ohms <= 0:
              raise ValueError('%f ohms must be > 0' % ohms)
          self._ohms = ohms

  r = BoundedResistance(1e3)
  r.ohms = 0  # ValueError: 0.000000 ohmes must be > 0
  BoundedResistance(-5)  # ValueError: -5.000000 ohmes must be > 0

  print(r.__dict__)  # {'_ohms': 1000.0, 'voltage': 0, 'current': 0}
  ```

- `BoundedResistance.__init__(-5)`는 `Resistor.__init__(-5)`를 호출하고, 이는 `self.ohms = -5`이기 때문에 결국 `BoundedResistance`의 `ohms.setter`가 수행된다.
  `ohms`라는 변수는 생기지 않고 실제로는 `_ohms`만 있다.

- `@property`는 subclass로는 공유되지만, 다른 클래스는 구현을 공유할 수 없다. `descriptor`를 쓰면 이를 해결할 수 있다.

- `@property`로 만든 getter에서 다른 어트리뷰트을 바꾸지 마라.

- `@property` 메소드는 빠르게 유지하고, 복잡하거나 느린 작업은 별도의 메소드를 두어라.



### 30. Consider `@property` Instead of Refactoring Attributes

아래 예제를 보자.

```python
def fill(bucket, amount):
    now = datetime.now()
    if now - bucket.reset_time > bucket.period_delta:
        bucket.quota = 0
        bucket.reset_time = now
    bucket.quota += amount

def deduct(bucket, amount):
    now = datetime.now()
    if now - bucket.reset_time > bucket.period_delta:
        return False
    if bucket.quota - amount < 0:
        return False
    bucket.quota -= amount
    return True

class Bucket(object):
    def __init__(self, period):
        self.period_delta = timedelta(seconds=period)
        self.reset_time = datetime.now()
        self.max_quota = 0       # 버켓에 들어있던 최대치
        self.quota_consumed = 0  # 사용한 양

    def __repr__(self):
        return ('Bucket(max_quota=%d, quota_consumed=%d)' %
               (self.max_quota, self.quota_consumed))

    @property
    def quota(self):  # @property 를 이용해 현재 남은 양을 조회할 수 있다.
        return self.max_quota - self.quota_consumed

    @quota.setter
    def quota(self, amount):  # setter는 적절하게 max_quota와 quota_consumed를 조절한다.
        delta = self.max_quota - amount
        if amount == 0:
            self.quota_consumed = 0
            self.max_quota = 0
        elif delta < 0:
            assert self.quota_consumed == 0
            self.max_quota = amount
        else:
            assert self.max_quota >= self.quota_consumed
            self.quota_consumed = delta
```

- `@property`는 기존의 어트리뷰트에 새로운 기능을 추가할 수 있다.
- `@property`로 위 예의 `quota`와 같은 증감이 있는 더 나은 데이터 모델을 만들 수 있다.
- `@proprty`를 너무 많이 쓴다 싶으면 리팩토링을 고려하라.



### 31. Use Descriptors for Reusable `@property` Methods

만약 여러 어트리뷰트 모두가 비슷한 동작을 하는 `@property`가 필요하다면 어떻게 해야할까?

```Python
class Exam(object):
    def __init__(self):
        self._writing_grade = 0
        self._math_grade = 0

    @staticmethod
    def _check_grade(value):
        if not (0 <= value <= 100):
            raise ValueError('Grade must be between 0 and 100')

    @property
    def writing_grade(self):
        return self._write_grade

    @writing_grade.setter
    def writing_grade(self, value):
        self._check_grade(value)
        eslf._writing_grade = value

    # ... _math_grade에 대해서도 반복
```

- 발리데이션과 같은 상황에서 같은 내용의 `@property`를 반복해서 써야 할 때에는, descriptor 클래스를 사용하라.


- decriptor는 `__get__`과 `__set__`메소드를 제공한다.
- 코드 재사용 측면에서 mix-in보다 낫다.

```python
class Grade(object):
    def __init__(self):
        self._value = 0

    def __get__(self, instance, instance_type):
        return self._value

    def __set__(self, instance, value):
        if not (0 <= value <= 100):
            raise ValueError('Grade must be between 0 and 100')
        self._value = value


class Exam(object):
    # 클래스 어트리뷰트
    math_grade = Grade()
    writing_grade = Grade()
    science_grade = Grade()


exam = Exam()
exam.writing_grade = 40
# Exam.__dict__['writing_grade'].__set__(exam, 40) 이렇게 인터프리트 된다.
print(exam.writing_grade)
# print(Exam.__dict__['writing_grade'].__get__(exam, Exam)) 이렇게 인터프리트 된다.
```

인스턴스의 `writing_grade`에 접근하려고 할때, 인스턴스에 해당 어트리뷰트가 없으면 클래스 어트리뷰트를 찾는다. 이 클래스 어트리뷰트는 `__get__`, `__set__` 메소드를 가진 오브젝트이고, 이제 descriptor 프로토콜이 적용된다.

그런데 위 코드에서는`Exam` 클래스가 정의될 때 `Grade` 인스턴스들이 한번만 생성되기 때문에, 모든 `Exam` 인스턴스들이 `Grade`를 공유한다는 문제가 있다.

따라서 `Grade`의 `_value`는 각 인스턴스의 값을 딕셔너리로 저장할 수 있어야 하는데, 일반적인 딕셔너리는 `Exam` 인스턴스가 지워지더라도 레퍼런스 카운트가 0이 되지 않고, 가비지 컬렉팅이 이루어지지 않아서 메모리 누수가 발생한다.

- desciptor에서 메모리를 효과적으로 관리하기 위해서는, `weakref` 모듈의 `WeakKeyDictionary` 모듈을 사용하라.
  이 딕셔너리는 가지고 있는 키가 마지막 레퍼런스 인 경우에, 더이상 키를 유지하지 않는 특성이 있다.

```python
class Grade(object):
    def __init__(self):
        self._value = WeakKeyDictionary()

    def __get__(self, instance, instance_type):
        if instance is None: return self
        return self._values.get(instance, 0)

    def __set__(self, instance, value):
        if not (0 <= value <= 100):
            raise ValueError('Grade must be between 0 and 100')
        self._values[instance] = value
```



### 32. Use `__getattr__`, `__getattribute__`, and `__setattr__` for Lazy Attributes

데이터베이스와 오브젝트를 연결하려고 할 때, 오브젝트는 데이터베이스의 스키마를 알 필요가 없다. 이를 구현하기 위해 `@property`나 descriptor를 떠올릴 수 있겠지만, 이들은 미리 정의되어야 하므로 이런 상황에는 적합하지 않다.
이런 상황에서는 `__getattr__` 메소드를 사용하면 된다. 만약 클래스가 이 메소드를 구현하고 있다면, 존재하지 않는 어트리뷰트를 호출하려고 할때, 이 메소드가 수행되어 동적으로 어트리뷰트를 생성할 수 있다.

```python
class LazyDB(object):
    def __init__(self):
        self.exists = 5

    def __getattr__(self, name):
        value = 'Value for %s' % name
        setattr(self, name, value)
        return value


data = LazyDB()
print(data.__dict__)  # {'exists': 5}
print(data.foo)       # Value for foo
print(data.__dict__)  # {'exists': 5, 'foo': 'Value for foo'}
```

- `__getattr__`는 존재하지 않는 어트리뷰트에 접근하려고 했을 때 수행된다.
  존재하는 어트리뷰트에 접근할때는 수행되지 않는다.

  ```python
  class LoggingLazyDB(LazyDB):
      def __getattr__(self, name):
          print('Called __getattr__(%s)' % name)
          return super().__getattr__(name)  # 무한재귀에 빠지지 않도록 super를 쓴다.


  data = LoggingLazyDB()
  print(data.exists)  # 5
  print(data.foo)     # Called __getattr__(foo)
                      # Value for foo
  print(data.foo)     # Value for foo
  ```

- `__getattribute__`는 어트리뷰트에 접근할 때 마다 호출된다. `__getattr__`보다 우선순위가 높다.

  ```python
  class ValidationDB(object):
      def __init__(self):
          self.exists = 5

      def __getattribute__(self, name):
          print('Called __getattribute__(%s)' % name)
          try:
              return super().__getattribute__(name)  # 기본 어트리뷰트를 바꾸지 않도록 super 먼저
          except AttributeError:  # 어트리뷰트가 없을 때 발생.
              value = 'Value for %s' % name
              setattr(self, name, value)
              return value


  data = ValidationDB()
  print(data.exists)  # 5
  print(data.foo)     # Called __getattribute__(foo)
                      # Value for foo
  print(data.foo)     # Called __getattribute__(foo)
                      # Value for foo
  ```

- 어트리뷰트를 제한하고 싶을 때애는 `__getattr__`과 `__getattribute__`모두에 `AttributeError`를 내도록 한다.

  ```python
  class MissingPropertyDB(object):
      def __getattr__(self, name):
          if name == 'bad_name':
              raise AttributeError('%s is missing' % name)
          # ...

      def __getattribute__(self, name):
          if name == 'bad_name':
              raise AttributeError('%s is missing' % name)
          # ...
  ```

  `__getattr__`에서만 제한하면, `__getattribute__`보다 우선순위가 낮으므로 제한되지 않는다.
  `__getattribute__`에서만 제한하면 `__getattr__`이 호출되어 제한되지 않는다.

- `__hasattr__`는 어트리뷰트가 있는지 알려주는데, 내부적으로 `__getattr__`또는 `__getattribute__`를 호출한다.

- `__setattr__`는 두개로 나누어지지 않고, 값이 할당 될 때마다 호출된다.

  ```python
  class LoggingSavingDB(object):
      def __setattr__(self, name, value):
          print('Called __setattr__(%s, %s)' % (name, value))
          super().__setattr__(name, value)


  data = LoggingSavingDB()
  data.foo = 5  # Called __setattr__(foo, 5)
  data.foo = 6  # Called __setattr__(foo, 6)
  ```

  `setattr(self, name, value)`는 `self.__setattr__(name, value)`와 같다.

- `__getattribute__`는 어트리뷰트에 접근할 때마다 호출되므로, 이 메소드 내에서 변수에 접근하면 무한루프에 빠진다.

  ```python
  class BrokenDictionaryDB(object):
      def __init__(self, data):
          self._data = {}

      def __getattribute__(self, name):
          print('Called __getattribute__(%s)' % name)
          return self._data[name]  # <- __getattribute__(_data)를 호출한다.
          # 다음과 같이 되어야 한다.
          data_dict = super().__getattribute__('_data')
          return data_
  ```



### 33. Validate Subclasses with Metaclasses

클래스의 유효성은 `__init__`에서 확인할 수 있는데, 이렇게 하면 인스턴스가 생성될 때 에러를 출력하게 된다. 메타클레스를 활용하면 클래스가 정의될 때부터 유효성을 검증할 수 있다.

- 메타클래스는 `type`을 상속한다. `__new__`메소드는 클래스의 내용을 파라메터로 받으며, 클래스가 선언될 때 호출된다.

  ```python
  class Meta(type):
      def __new__(meta, name, bases, class_dict):
          print((meta, name, bases, class_dict))
          return type.__new__(meta, name, bases, class_dict)


  class MyClass(object, metaclass=Meta):
      # __metaclass__ = Meta  <-- python2에서는 이렇게 메타클래스를 적용한다.
      stuff = 123

      def foo(self):
          pass

  # 다음이 출력된다.
  # (<class '__main__.Meta'>,
  #  'MyClass',
  #  (<class 'object'>, ),
  #  {'__module__': '__main__',
  #   '__qualname__': 'MyClass',
  #   'foo': <function MyClass.foo at 0x102c7dd08,
  #   'stuff': 123})
  ```

- `__new__`메소드에서 `class_dict`를 통해 클래스 어트리뷰트에 접근함으로써 유효성을 검증할 수 있다. 클래스 선언이 완료된 시점에서 호출된다.

  ```python
  class ValidatePolygon(type):
      def __new__(meta, name, bases, class_dict):
          if bases != (object, ):
              if class_dict['sides'] < 3:
                  raise ValueError('Polygons need 3+ sides')
          return type.__new__(meta, name, bases, class_dict)


  class Polygon(object, metaclass=ValidatePolygon):
      sides = None

      @classmethod
      def inferior_angles(cls):
          return (cls.sides - 2) * 180


  class Triangle(Polygon):
      sides = 3

  print('Before class')      # Before class
  class Line(Polygon):
      print('Before sides')  # Before sides
      sides = 1
      print('After sides')   # After sides
                             # ValueError: Polygons need 3+ sides
  print('After class')       # 출력되지 않는다.
  ```



### 34. Register Class Existence with Metaclasses

메타클래스를 이용해, 새로 생성된 타입(클래스)들에 등록하는 등의 작업을 추가할 수 있다. 클래스를 시리얼라이즈 하고, 디시리얼라이즈 하는 예를 생각해보자.

```python
class Serializable(object):
    def __init__(self, *args):
        self.args. = args

    def serialize(self):
        return json.dumps({'args': self.args})


class Deserializable(Serializable):
    @classmethod
    def deserialize(cls, json_data):
        params = json.loads(json_data)
        return cls(*params['args'])

point = Point2D(5, 3)
data = point.serialize  # {'args': [5, 3]}
point = Point2D(data)
```

이렇게 `Deserializable`까지 구현하고 나면, 이를 상속한 클래스는 시리얼라이즈, 디시리얼라이즈가 가능하다. 하지만 이런 구현은 json 데이터의 원래 클래스를 알지 못하면 적절한 클래스로 디시리얼라이즈 할 수 없다는 문제가 있다.

이를 해결하기 위해서는 시리얼라이즈 된 데이터에 클래스 명을 넣고, 나중에 이 클래스 명을 이용해 생성자를 가져오면 된다. 클래스 명으로 생성자를 가져오기 위해서는 저장소를 만들고 클래스를 정의할 때마다 등록한다.

```python
class BetterSerializable(object):
    def __init__(self, *args):
        self.args. = args

    def serialize(self):
        return json.dumps({
            'class': self.__class__.__name__,
            'args': self.args
        })


registry = {}

def register_class(target_class):
    registry[target_class.__name__] = target_class

def deserialize(data):
    params = json.loads(data)
    name = params['class']
    target_class = registry[name]
    return target_class(*params['args'])

class Point2D(BetterSerializable):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.x = x
        self.y = y

register_class(Point2D)  # 이렇게 등록을 꼭 해줘야한다.
```

새로 생긴 문제는 클래스를 정의할 때마다 `register_class`함수를 호출해 등록을 해줘야 한다는 점이다.

메타클래스를 이용해 클래스 정의 시점에 유효성 검사를 했던 것을생각해보면, 메타클래스로 이 작업을 클래스 정의 시점에 자동으로 적용되게 할 수 있다.

```python
class Meta(type):
    def __new__(meta, name, bases, class_dict):
        cls = type.__new__(meta, name, bases, class_dict)
        register_class(cls)
        return cls

class RegisteredSerializable(BetterSerializable, metclass=Meta):
    pass
```

이제 `RegisteredSerializable`을 상속받은 클래스는, 정의 시점에서 `register_class`를 호출하게 되고, 별도의 과정 없이 시리얼라이즈, 디시리얼라이즈가 가능하다.

- class registration은 모듈러 프로그램을 만드는데 효과적인 패턴이다.
- 메타클래스를 이용해 서브클래스가 생성될 때 까먹지 않고 자동으로 등록할 수 있다.



### 35. Annotate Class Attributes with Metaclasses

메타클래스는 어노테이션이 달린 프로퍼티를 클래스 생성 후 실제로 사용되기 전에 수정할 수 있다. 데이터베이스에 있는 값을 가져오는 상황을 생각해보자.

```python
class Field(object):
    def __init__(self, name):
        self.name = name
        self.internal_name = '_' + self.name

    def __get__(self, instance, instance_type):
        if instance is None: return self
        return getattr(instance, self.internal_name, '')

    def __set__(self, instance, value):
        setattr(instance, self,internal_name, value)


class Customer(object):
    first_name = Field('first_name')
    last_name = Field('last_name')  # 어트리뷰트의 이름을 넣어 주어야 한다.


foo = Customer()
print(repr(foo.first_name), foo.__dict__)  # '' {}
foo.first_name = 'Euclid'
print(repr(foo.first_name), foo.__dict__)  # 'Euclid' {'_first_name': 'Euclid'}.
```

위와 같은 구현은 어트리뷰트의 이름을 `Field`의 파라메터로 또 한번 써줘야 한다는 것이다. 메타클래스를 활용하면 이 반복을 줄일 수 있다.

```python
class Field(object):
    pass  # 메타클래스에서 어트리뷰트가 할당되므로 초기화가 필요 없다.

class Meta(type):
    def __new__(meta, name, bases, class_dict):
        for key, value in class_dict.items():
            if isinstance(value, Field):
                value.name = key
                value.internal_name = '_' + key
        cls = type.__new__(meta, name, bases, class_dict)
        return cls

class DatabaseRow(object, metaclass=Meta):
    pass

class Customer(DatabaseRow):
    first_name = Field()
    last_name = Field()
```

- 메타클래스에서 어트리뷰트를 마저 할당해서 클래스를 완성할 수 있다.1
- 런타임에서 어트리뷰트를 할당하기 위해서는 descriptor와 메타클래스를 사용할 수 있다.
- 메타클래스와 descriptor 모두 `weakref`를 사용하지 않으면서도 메모리 누수를 잡을 수 있다.


<br/>
-----
<br/>


## Chapter 5. Concurrency and Parallelism

parallel 프로그램은 병렬수행으로 전체 작업 시간을 단축시키지만, concurrent 프로그램은 병렬적으로 수행되는 듯 하지만 전체 속도가 빨라지지는 않는다.

Python은 concurrent 프로그램을 짜기 쉽고, 시스템콜, 서브프로세스, C-extensions으로 병렬 처리도 할 수 있다. 하지만, concurrent 프로그램이, 진짜 병렬적으로 동작하도록 짜는기는 아주 어렵다.



### 36. Use `subprocess` to Manage Child Processes

Python에서 만든 child 프로세스는 CPU 코어를 모두 사용하게끔 병렬로 수행될 수 있다.

- `popen`, `popen2`, `os.exec*` 등이 있지만, 서브프로세스를 다루는데에는 `subprocess` 모듈이 최고다.

  ```python
  proc = subprocess.Popen(['echo', 'Hello from the child!'], stdout=subprocess.PIPE)
  out, err = proc.communicate()
  print(out.decode('utf-8'))  # Hello from the child!
  ```

- child 프로세스는 parent 프로세스(Python)와 독립적으로 수행된다. 그 사이에 Python으로 다른 작업을 수행할 수 있다.

  ```python
  proc = subprocess.Popen(['sleep', '0.3'])
  while proc.poll() is None:
      print('Working...')

  print('Exit status', proc.poll())

  # Working...
  # Working...
  # Exit status 0
  ```

- 여러 child 프로세스를 병렬적으로 돌릴 수 있다. `communicate` 메소드로 프로세스가 완료될 때까지 기다릴 수 있다.

  ```python
  def run_sleep(period):
      proc = subprocess.Popen(['sleep', str(period)])
      return proc

  start = time()
  procs = []
  for _ in range(10):
      proc = run_sleep(0.1)
      procs.append(proc)

  for proc in procs:
      proc.communicate()
  end = time()
  print('Finished in %.3f seconds' % (end - start))  # Finished in 0.117 seconds
  ```

- stdin 을 입력할 수 있다.

  ```python
  def run_openssl(data):
      env = os.environ.copy()
      env['password'] = b'\xe24U\n\xd0Ql3S\x11'
      proc = subprocess.Popen(['openssl', 'enc', '-des3', '-pass', 'env:password'],
                             env=env,
                             stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE)
      proc.stdin.write(data)
      proc.stdin.flush()  # child가 인풋을 받게 한다.
      return proc

  procs = []
  for _ in range(3):
      data = os.urandom(10)  # 랜덤 바이트. 암호화 할 네트워크 소켓, 파일, 유저인풋 등이 될 수 있다.
      proc = run_openssl(data)
      procs.append(proc)

  for proc in procs:
      out, err = proc.communicate()
      print(out[-10:])

  # b']~\x87G\x9d\xaa2\xa4=:'
  # b'\xac\xce\x15\x1d\nDy\xa5Z\x89'
  # b'\xcb\x88\x02Xw\x08P-\xf9\xb6'
  ```

- PIPE로 여러 쉘 스크립트를 연결해서 사용할 수 있다.

  ```python
  def run_md5(input_stdin):  # hashlib 모듈에서 md5를 제공하므로 이런 함수를 쓸 일은 사실 없다.
      proc = subprocess.Popen(['md5'],
                             stdin=input_stdin,
                             stdout=subprocess.PIPE)
      return proc

  input_procs = []
  hash_procs = []
  for _ in range(3):
      data = os.urandom(10)
      proc = run_openssl(data)E
      input_procs.append(proc)
      hash_proc = run_md5(proc.stdout)  # .stdout를 인자로 넣어 연결한다.
      hash_procs.append(hash_proc)

  for proc in input_procs:
      proc.communicate()
  for proc in hash_procs:
      out, err = proc.communicate()
      print(out.strip())
  ```

- Python3에서는 타임아웃을 걸 수 있다. Python2에서는 `proc.stdin`, `proc.stdout`, `proc.stderr`에 `select` 모듈을 쓰면 된다.

  ```python
  proc = run_sleep(10)
  try:
      proc.communicate(timeout=0.1)
  except subprocess.TimeoutExpired:
      proc.terminate()
      proc.wait()

  print(proc.poll())  # -15
  ```



### 37. Use Threads for Blocking I/O, Avoid for Parallelism

기본 Python은 CPython이다. CPython은 우선 바이트코드로 컴파일되고, 스택기반 인터프리터로 수행된다. 바이트코드 인터프리터는 수행되는동안 상태를 일관되게 유지해야한다. Python은 GIL(global interpreter lock)으로 일관성을 보장한다.

GIL은 CPython이 preemptive 멀티쓰레딩으로부터 영향받지 않도록 하는 mutex이다. 쓰레드 인터럽트는 인터프리터의 상태를 망가뜨릴 수 있다. GIL은 이런 인터럽트를 막고, 모든 바이트코드 명령어들이 제대로 동작하게 한다.

GIL은 치명적인 문제가 있는데, Python자체가 멀티쓰레드를 지원함에도 불구하고 멀티쓰레드를 이용하는 C++나 Java코드를 병렬처리 할 수 없다는 점이다.

인수들을 구하는 코드를 단순히 순서대로 돌렸을 경우에 걸리는 시간을 보자

```python
def factorize(number):
    for i in range(1, number + 1):
        if number % i == 0:
            yield i

numbers = [24134124, 3412334, 12434124, 343414124]
start = time()
for number in numbers:
    list(factorize(number))
end = time()
print('Took %.3f seconds' % (end - start))  # Took 31.118 seconds
```

멀티쓰레딩을 사용해 처리하면 다음과 같다.

```python
from threading import Thread

class FactorizeThread(Thread):
    def __init__(self, number):
        super().__init__()
        self.number = number

    def run(self):
        self.factors = list(factorize(self.number))

start = time()
threads = []
for number in numbers:
    thread = FactorizeThread(number)
    thread.start()
    threads.append(thread)
for thread in threads:
    thread.join()
end = time()
print('Took %.3f seconds' % (end - start))  # Took 31.706 seconds
```

- 심지어 더 많이 걸린다. 이처럼 일반적인 CPython 인터프리터에서는, GIL 때문에 여러 바이트코드를 병렬로 돌릴 수 없다.

CPython으로 멀티코어를 활용할 수는 있으나, 사실 `Thread` 모듈로는 할 수 없고 추가적인 노력이 필요하다. 그럼에도 불구하고 쓰레드를 사용하는 이유는 크게 두가지가 있다.

첫째로, 실제로는 동시에 수행되지 않더라도, 겉으로 보기에 프로그램이 병렬적인 작업을 수행한다는것을 명시할 수 있다.

둘째로, 파일 읽기쓰기, 네트워크 통신, 하드웨어 장치 조작 등의 blocking I/O를 다루기 위해서다. Python은 몇가지 외부 환경과 상호작용할 수 있도록 OS에 시스템콜을 할 수 있는데, 이때 쓰레드는 프로그램을 OS의 작업과 분리시킴으로써 blocking I/O를 다루는 것을 도와준다.

예를들어 원격 헬리콥터에 시리얼포트를 통해 신호를 보낸다고 해보자. 이 작업을 위한 프록시로 비교적 느린 시스템콜(`select`)를 사용할텐데, 아래 함수는 싱크로너스 시리얼포트를 사용하는 것 처럼 OS로 하여금 0.1초 정도 블락 한 후 프로그램에 권한을 넘겨주도록한다.

```python
import select

def slow_systemcall():
    select.select([], [], [], 0.1)

start = time()
for _ in range(5):
    slow_systemcall()
end = time()
print('Took %.3f seconds' % (end - start))  # Took 0.516 seconds
```

이 코드의 문제는 프로그램이 `slow_systemcall`을 돌리는 동안 다른 작업을 하지 못한다는 것이다. 프로그램의 메인 쓰레드는 `select` 시스템 콜을 하는 쓰레드에 의해 블락된다. 헬기에 명령을 내리고, 그 와중에 계속 계산 작업을 수행하려면 어떻게 해야할까. blocking I/O와 계산을 동시에 수행하고 싶다면, 시스템콜을 쓰레드로 옮겨야한다.

아래 코드는 동시에 여러 시리얼포트의 헬기에 명령을 내리면서, 메인 쓰레드는 계산작업을 수행할 수 있게 한다.

```python
start = time()
threads = []
for _ in range(5):
    thread = Thread(target=slow_systemcall)
    thread.start()
    threads.append(thread)

def compute_helicopter_location(index):
    # ...

for i in range(5):
    compute_helicopter_location(i)
for thread in threads:
    thread.join()
end = time()

print('Took %.3f seconds' % (end - start))  # Took 0.106 seconds
```

이처럼 시스템콜은 CIL이 있더라도 병렬적으로 수행된다. GIL은 Python코드가 병렬로 동작하는 것은 막지만, 시스템콜에는 영향을 미치지 않는다. 이는 Python이 시스템콜을 호출하기 직전에 GIL을 놓고, 명령을 내린 후 발고 GIL을 다시 얻기 때문에 가능하다.

- 다시말해 쓰레드는 시스템콜을 병렬적으로 수행할 수 있으며, blocking I/O와 계산을 동시에 할수 있도록 한다.

  `asyncio`같은 모듈로 blocking I/O를 처리하는 다른 방법들이 있고 장점도 있지만, 이들은 다른 모델에 적용하고자 할 때 리팩토링이 필요하다. 쓰레드는 프로그램의 변화를 최소로 하면서 blocking I/O를 할 수 있는 가장 간단하고 좋은 방법이다.



### 38. Use `Lock` to Prevent Data Races in Threads

GIL이 멀티쓰레드가 병렬적으로 수행되는 것을 막기 때문에 별도의 mutex 락이 필요 없다고 생각하기 쉬지만 그렇지 않다. 한번에 하나의 Python 쓰레드만 동작하기는 하지만, 자료구조에 쓰는 작업은 다른 바이트코드 명령에 의해 영향 받을 수 있다. 따라서 여러 쓰레드에서 동시에 한 오브젝트를 사용하는 것은, 자료구조의 불변성을 해칠 수 있고, 프로그램의 상태를 망칠 수 있다.

- 아래와 같이 여러 쓰레드가 한 오브젝트의 값을 수정하는 경우 데이터가 어긋날 수 있다.

```python
class Counter(object):  # 카운트를 위한 클래스이다.
    def __init__(self):
        self.count = 0

    def increment(self, offset):
        self.count += offset


def worker(how_many, counter):  # how_many만큼 카운터를 증가시킨다.
    for _ in range(how_many):
        counter.increment(1)


def run_threads(func, number_of_thread, *args):  # 여러 쓰레드에서 func를 수행한다.
    threads = []
    for _ in range(number_of_thread):
        thread = Thread(target=func, args=args)
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()

number_of_thread = 5
how_many = 10**5
counter = Counter()  # 여러 쓰레드는 한 카운터를 공유한다.
run_threads(worker, number_of_thread, how_many, counter)
print('Counter should be %d, found %d' % (number_of_thread * how_many, counter.count))
# Counter should be 500000, found 383202
```

- GIL에 의해 한번에 한 쓰레드만 수행하긴 하지만, 여러 쓰레드에 계산 시간을 동등하게 배분하면서 빠르게 스위치한다. 기존 쓰레드가 중지되고, 다른 쓰레드로 CPU 자원을 넘기는 일은 atomic한 연산 중간에도 벌어질 수 있다. `+=`과 같은 연산은 실제로 `getattr`, `+`, `setattr`의 세가지 연산으로 이루어져 있기 때문에 위와 같은 일이 벌어진다.


- `threading` 모듈의 `Lock`을 이용하면 mutex를 보장하여, 작업 중간에 쓰레드가 바뀌는 일을 막을 수 있다.

```python
class LockingCounter(object):
    def __init__(self):
        self.lock = Lock()
        self.count = 0

    def increment(self, offset):
        with self.lock:  # with 구문을 사용하여 lock을 얻고, 작업이 끝나면 리리즈 하도록 한다.
            self.count += offset

counter = Counter()  # 여러 쓰레드는 한 카운터를 공유한다.
run_threads(worker, number_of_thread, how_many, counter)
print('Counter should be %d, found %d' % (number_of_thread * how_many, counter.count))
# Counter should be 500000, found 500000
```



### 39. Use `Queue` to Coordinate Work Between Threads

concurrent 잡들의 결과를 연결하는 파이프라인 작업을구성해야 할 때가 있다. 특히 병렬적으로 수행될 수 있는 blocking I/O나, subprocess를 포함하는 경우 유용하다.

이미지를 다운받아 사이즈를 조절하고 다시 업로드 하는 작업을 concurrent하게 연결한다고 해보자. 파이프라인의 각 단계간에 작업결과물을 넘겨줘야 하는데, 이는 thread-safe한 producer-consumer queue로 구현할 수 있다. 프로듀서는 이미지를 대기열의 마지막에 추가하고, 컨슈머는 대기열의 앞에서부터 이미지를 처리한다.

```python
class MyQueue(object):
    def __init__(self):
        self.items = deque()
        self.lock = Lock

    def put(self, item):
        with self.lock:
            self.items.append(item)

    def get(self):
        with self.lock:
            return self.items.popleft()
```

워커는 큐에서 작업을 빼서 쓰레드로 수행하고 그 결과를 다른 큐에 넣는다.

```python
class Worker(Thread):
    def __init__(self, func, in_queue, out_queue):
        super().__init__()
        self.func = func
        self.in_queue = in_queue    # 작업할 내용을 받을 큐를 지정한다.
        self.out_queue = out_queue  # 작업 결과를 보낼 큐를 지정한다.
        self.polled_count = 0
        self.work_done = 0

    def run(self):
        while True:  # 무한루프를 돌며 큐를 확인하고 처리한다.
            self.polled_count += 1
            try:
                item = self.in_queue.get()
            except IndexError:
                sleep(0.01)  # 남은 작업이 없는 경우 IndexError를 낸다.
            else:
                result = self.func(item)
                self.out_queue.put(result)
                self.work_done += 1
```

이제 작업에 맞게 큐를 생성하고, 워커에게 할당한다.

```python
download_queue = MyQueue()
resize_queue = MyQueue()
upload_queue = MyQueue()
done_queue = MyQueue()
threads = [
  Worker(download, download_queue, resize_queue),
  Worker(resize, resize_queue, upload_queue),
  Worker(upload, upload_queue, done_queue),
]

for thread in threads:
    thread.start()
for _ in range(1000):  # 테스트를 위해 큐에 더미 오브젝트를 넣는다.
    download_queue.put(object())
while len(done_queue.items) < 1000:  # 작업이 끝나길 busy waiting한다.
    # 작업을 하는 동안 다른 일을 할 수 있다.
    # ...
processed = len(done_queue.items)
polled = sum(t.polled_count for t in threads)
print('Processed', processed, 'items after polling', polled, 'times')
# Processed 1000 items after polling 3030 items
```

큐를 확인하기 위해 반복적으로 폴링하고, `IndexError`를 내는 경우가 있기 때문에 폴링 횟수는 3000번보다 더 많게 된다. 만일 파이프라인에서 빠른 작업이 느린 작업 뒤에 위치한다면, 큐를 확인하고 에러를 내는 작업이 더 많아지고 결국 CPU자원을 낭비하게된다.

위 구현엔 잘못된 점이 몇가지 더 있다. 작업이 다 되었는지 확인하는 busy waiting이 있다는 점, 그리고 워커 쓰레드에게 작업종료를 알리는 시그널이 없어 이 busy 루프 안에서 `Worker`의 `run` 메소드가 영원히 수행된다는 점이다. 무엇보다 가장 문제는, 나중 작업이 느릴 경우에 앞 큐는 한없이 길어지고 메모리부족으로 프로그램이 죽을 수도 있다는 점이다.

`queue`모듈의 `Queue`클레스에는 이런 문제들을 해결할 수 있는 기능이 있다.

- `Queue`의 `get` 메소드는 새로운 데이터가 있을때까지 block시킴으로써, 워커가 busy waiting 하지 않게끔 한다.

  ```python
  from queue import Queue
  queue = Queue()

  def consumer():
      print('Consumer waiting')
      queue.get()  # 아래의 put 이후에 수행된다.
      print('Consumer done')

  thread = Thread(target=consumer)
  thread.start()

  print('Producer putting')
  queue.put(object())  # 위의 get 이전에 수행된다.
  thread.join()
  print('Producer done')

  # 출력
  # Consumer waiting
  # Producer putting
  # Consumer done
  # Producer done
  ```

  위에서 보는 것처럼, thread가 먼저 시작되었더라도, `put`되기 전에 `get`을 수행하지 않는다.

- `Queue(number)`과 같이 인스턴스를 생성하여, 버퍼 사이즈를 지정할 수 있다.

  ```python
  queue = Queue(1)  # 버퍼사이즈를 1로 설정한다.

  def consumer():
      time.sleep(0.1)          # 대기
      queue.get()              # 두번째로 수행된다.
      print('Consumer got 1')
      queue.get()              # 네번째로 수행된다.
      print('Consumer got 2')

  thread = Thread(target=consumer)
  thread.start()
  queue.put(object())          # 처음으로 수행된다.
  print('Producer put 1')
  queue.put(object())          # 세번째로 수행된다.
  print('Producer put 2')
  thread.join()
  print('Producer done')

  # 출력
  # Producer put 1
  # Consumer got 1
  # Producer put 2
  # Consumer got 2
  # Producer done
  ```

- `task_done` 메소드로 작업의 진행상황을 추적할 수 있다. 이로써 `done_queue`를 폴링하는 작업을 없앨 수 있다.

  ```python
  in_queue = Queue()

  def consumer():
      print('Consumer waiting')
      work = in_queue.get()      # 두번째로 완료된다.
      print('Consumer working')
      # Doing work ...
      print('Consumer done')
      in_queue.task_done()       # 세번째로 완료된다.

  Thread(target=consumer).start()
  in_queue.put(object())         # 처음으로 완료된다.
  print('Producer waiting')
  in_queue.join()                # 마지막으로 완료된다.

  # 출력
  # Consumer waiting
  # Producer waiting
  # Consumer working
  # Consumer done
  # Producer done
  ```

아래와 같이, 작업종료를 알리는 작업을 큐에 넣어 워커들을 종료시키는 큐를 만들 수 있다. `__iter__` 메소드에서 작업종료를 확인하고 이터레이션을 종료시키며, `task_done`로 작업 진행을 알수 있게 한다.

```python
class ClosableQueue(Queue):
    SENTINEL = object()

    def close(self):
        self.put(self.SENTINEL)

    def __iter__(self):
        while True:
            item = self.get()
            try:
                if item = self.SENTINEL:
                    return  # iteration을 중지하고, thread가 종료되게한다.
                yield item
            finally:
                self.task_done()
```

이제 새로 만든 큐에 맞게 워커를 다시 작성하는데, 이 워커는 이터레이션이 끝나면 종료된다.

```python
class StoppableWorker(Thread):
    def __init__(self, func, in_queue, out_queue):
        # ...

    def run(self):
        for item in self.in_queue:
            result = self.func(item)
            self.out_queue.put(result)
```

큐를 `join`해서 작업이 끝나길 기다리고, 다음 큐를 종료한다.

```python
download_queue = ClosableQueue()
resize_queue = ClosableQueue()
upload_queue = ClosableQueue()
done_queue = ClosableQueue()
threads = [
  StoppableWorker(download, download_queue, resize_queue),
  StoppableWorker(resize, resize_queue, upload_queue),
  StoppableWorker(upload, upload_queue, done_queue),
]

for thread in threads:
    thread.start()
for _ in range(1000):  # 테스트를 위해 큐에 더미 오브젝트를 넣는다.
    download_queue.put(object())
download_queue.close()  # 작업을 종료한다.
download_queue.join()
resize_queue.close()
resize_queue.join()
upload_queue.close()
upload_queue.join()
print(done_queue.qsize(), 'items finished')
# 1000 items finished
```

- 파이프라인으로 멀티 쓰레드를 이요한 concurrent 작업 시퀀스를 처리할 수 있다.
- busy waiting, 워커 종료, 메모리 관리를 신경쓰라.
- `Queue` 클래스엔 blocking, 버퍼사이즈, join, 등 파이프라인을 만드는데 필요한 유용한 기능들이 있다.



### 40. Consider Coroutines to Run Many Functions Concurrent

쓰레드가 여러 작업을 동시에 수행할 수 있게 하긴 하지만, 몇가지 문제가 있다.

- 쓰레드간 작업공유를 위해 `Lock`, `Queue`와 같은 별도의 자료구조들이 필요하기에, 코드가 복잡해진다.
- 쓰레드당 대략 8mb의 메모리가 필요하다. 수천 수만 유저의 리퀘스트를 처리해야하는 서버나, 파티클 시뮬레이션 등과 같은 상황에서, 각 동작에 별도의 쓰레드를 할당하는 것은 불가능하다.
- 쓰레드를 계속해서 생성하고 종료하면 오버헤드가 쌓여서 전체 시스템이 느려진다.

*coroutine*을 쓰면 이런 문제를 피할 수 있다. coroutine은 제너레이터의 확장으로, 오버헤드가 거의 없고, 1kb미만의 메모리를 사용한다.

coroutine은 각 `yield` 이후에 값을 함수로 다시 돌려받는 제너레이터라고 볼 수 있다. 제너레이터 함수는 `yield`의 결과로, `send`함수로 보내진 값을 받는다.

```python
def my_coroutine():
    while True:
        receive = yield
        print('Received:', received)

it = my_coroutine()
next(it)             # coroutine을 준비시킨다.
it.send('First')     # Receive: First
it.sned('Second')    # Receive: Second
```

`next`는 제너레이터가 `yield`함수까지 진행해서 `send`로 값을 받을 수 있게 준비시킨다. `yield`와 `send`는 제너레이터가 yield된 값을 바꿔가며 동작할 수 있게 한다.

예를들어 받은 값들 중 최소 값을 반환하는 coroutine을 구현한다면 다음과 같다.

```python
def minimize():
    current = yield  # 단순한 yield로 coroutine을 준비하고 초기값을 받는다.
    while True:
        value = yield current  # 현재까지의 최소값을 반환하며, 다음 값을 받는다.
        current = min(value, current)

it = minimize()
next(it)
print(it.send(10))  # 10
print(it.send(4))   # 4
print(it.send(22))  # 4
print(it.send(-1))  # -1
```

#### The Game of Life

coroutine으로 그리드 위의 셀들이 죽었다 살았다 변하는 콘웨이의 [라이프 게임](https://ko.wikipedia.org/wiki/%EB%9D%BC%EC%9D%B4%ED%94%84_%EA%B2%8C%EC%9E%84)을 만들어보자.

```python
ALIVE = '*'
EMPTY = '-'

Query = namedtuple('Query', ('y', 'x'))

def count_neighbors(y, x):  # 주변에 살아있는 셀들의 수를 계산한다.
    n_ = yield Query(y + 1, x + 0)
    ne = yield Query(y + 1, x + 1)
    e_ = yield Query(y + 0, x + 1)
    se = yield Query(y - 1, x + 1)
    s_ = yield Query(y - 1, x + 0)
    sw = yield Query(y - 1, x - 1)
    w_ = yield Query(y + 0, x - 1)
    nw = yield Query(y + 1, x - 1)
    neighbor_states = [n_, ne, e_, se, s_, sw, w_, nw]
    count = 0
    for state in neighbor_states:
        if state == ALIVE:
            count += 1
    return count

Transition = namedtuple('Transition', ('y', 'x', 'state'))

def step_cell(y, x):  # 셀의 다음 상태를 계산한다.
    state = yield Query(y, x)
    neighbors = yield from count_neighbors(y, x)  # yield from으로 coroutine들을 결합한다.
    next_state = game_logic(state, neighbors)  # yield from이 다 끝나면 수행된다.
    yield Transition(y, x, next_state)

def game_logic(state, neighbors):  # 주변에 살아있는 셀이 셋이면 살고, 아니면 죽는다.
    if state == ALIVE:
        return ALIVE if 2 <= neighbors <= 3 else EMPTY
    else:
        return ALIVE if neighbors == 3 else EMPTY

TICK = object()  # 게임 싸이클 한번이 끝났음을 뜻한다.

def simulate(height, width):  # 셀들의 상태를 계속해서 계산하고 반환한다.
    while True:
        for y in range(height):
            for x in range(width):
                yield from step_cell(y, x)
        yield TICK
```

이와같이 구현하면 `simulate`는 주변 환경들과 완전히 분리된다. 그리드가 어떻게 구현되는지, `Query`, `Transition`, `TICK` 값들이 어떻게 다루어지는지, 초기값이 어떻게 세팅되는지 정의하지 않고 로직에만 집중한다. 각 셀들은 `step_cell`에 의해 변화하고 모두 변화하고 나면 `TICK`으로 갱신의 끝을 알린다.

coroutine은 이처럼 로직에만 집중할 수 있게 한다. 환경에 대한 코드와 하고자 하는 구현을 분리시키고, coroutine들이 병렬적으로 동작하는 것처럼 보이게 한다.

이제 `simulate`이 동작할 주변 환경을 구현해보자.

```python
class Grid(object):
    def __init__(self, height, width):
        self.height = height
        self.width = width
        self.rows = []
        for _ in range(self.height):
            self.rows.append([EMPTY] * self.width)

    def __str__(self):
        return '\n'.join([''.join(row) for row in self.rows])

    def query(self, y, x):
        return self.rows[y % self.height][x % self.width]

    def assign(self, y, x, state):
        self.rows[y % self.height][x % self.width] = state
```

마지막으로 `simulate`과 그 내부 다른 coroutine에서 yield되는 값을 사용하는 함수를 작성한다. 이 함수는 coroutine의 동작과 주변 환경을 연결한다. 그리드의 모든 셀에 대해 다음 상태를 계산하고 새로운 그리드를 반환한다.

```python
def live_a_generation(grid, sim):
    progeny = Grid(grid.height, grid.width)
    item = next(sim)
    while item is not TICK:
        if isinstance(item, Query):
            state = grid.query(item.y, item.x)
            item = sim.send(state)
        else:
            progeny.assign(item.y, item.x, item.state)
            item = next(sim)
    return progeny
```

이제 그리드를 초기화하고 시뮬레이션을 돌릴 수 있다.

```python
grid = Grid(5, 5)         # Blinker pattern
grid.assign(2, 1, ALIVE)  # -----
grid.assign(2, 2, ALIVE)  # -----
grid.assign(2, 3, ALIVE)  # -***-
for i in range(50):       # -----
    print(grid)           # -----
    grid = live_a_generation(grid, sim)
    sleep(0.1)
```

#### Coroutines in Python 2

Python2에는 몇가지 기능이 지원되지 않아, 좀 덜이뻐진다.

첫째로, `yield from`이 되지 않아 이터레이션을 돌려야한다.

```python
# Python 2
def delegated():
    yield 1
    yield 2

def composed():
    yield 'A'
    for value in delegated():  # yield from delegated() (in Python 3)
        yield value
    yield 'B'

print list(composed())  # ['A', 1, 2, 'B']
```

둘째로, 제너레이터에서 `return`을 쓸 수 없다는 것이다. 같은 효과를 내기 위해 `try/except/finally`를 써서 에러를 내야한다.

```python
# Python 2
class MyReturn(Exception):
    def __init__(self, value):
        self.value = value

def delegated():
    yield 1
    raise MyReturn(2)
    yield 'Not reached'

def composed():
    try:
        for value in delegated():
            yield value
    except MyReturn as e:
        output = e.value
    yield output * 4

print list(composed())  # [1, 8]
```



### 41. Consider `concurrent.futures` for True Parallelism

퍼포먼스가 중요할 때엔 병렬작업이 필요하다. 일반적으로는 멀티쓰레드로 여러 코어를 사용하며 병렬작업이 가능하지만, Python에서는 GIL때문에 멀티쓰레드는 병렬적으로 동작하지 않는다. Python에서는 어떻게 멀티코어를 활용하는 프로그램을 작성할 수 있을까.

Python은 C-extension을 위한 API가 잘 되어있기 때문에 퍼포먼스가 중요한 부분을 따로 떼서 C 코드를 작성할 수 도 있다. 이렇게 작성한 C 코드는 멀티쓰레드 기반으로 병렬적으로 동작할 수 있다. C 코드는 Python에 비해 길고 복잡하며, 별도로 작성했을 때 추가적인 테스트가 많이 필요하다. [Cython](http://cython.org/)이나 [Numba](http://numba.pydata.org/)와 같은 사이트에서 이미지처리, 텍스트 파싱, 행렬계산등을 위한 원하는 C-extension 을 찾을 수도 있다.

하지만 느려지는 원인 부가 한두군데도 아닐텐데, 이를 모두 C로 포팅할 수는 없다. 이럴 때, `concurrent.future` 모듈을 통해 `multiprocessing` 모듈을 사용하면, 좀 더 편하게 병렬 코드를 작성할 수 있다. 이 모듈은 child 프로세스에 새로 인터프리터를 띄워 멀티코어를 활용한다. 각 child 프로세스는 작업이 끝나면 결과를 반환한다.

GCD를 구하는 코드를 그냥 돌리는 것과 `concurrent.futures` 모듈의 `ThreadPoolExecutor` 클래스를 이용하여 돌리는 것, 그리고 `ProcessPoolExecutor`를 이용해 돌리는 것을 비교해보자.

```python
def gcd(pair):
    a, b = pair
    low = min(a, b)
    for i in range(low, 0, -1):
        if a % i == 0 and b % i == 0:
            return i

numbers = [(1938323, 2893844), (4981932, 1393843), (1385764, 4928467), (8398471, 2938123)]

start = time()
results = list(map(gcd, numbers))
end = time()
print('Took %.3f seconds' % (end - start))  # Took 0.550 seconds

start = time()
pool = ThreadPoolExecutor(max_workers=4)  # 쓰레드를 4개 사용한다.
results = list(pool.map(gcd, numbers))
end = time()
print('Took %.3f seconds' % (end- start))  # Took 0.670 seconds 더 오래 걸린다.

start = time()
pool = ProcessPoolExecutor(max_workers=4)  # 쓰레드를 4개 사용한다.
results = list(pool.map(gcd, numbers))
end = time()
print('Took %.3f seconds' % (end- start))  # Took 0.231 seconds
```

`ProcessPoolExecutor`를 이용한 코드는 다음과 같이 동작한다.

1. `numbers`의 각 값을 `map`으로 받는다.
2. `pickle` 모듈로 각 데이터를 바이너리로 시리얼라이즈한다.
3. 시리얼라이즈 된 데이터를 메인 인터프리터 프로세스에서 child 인터프리터 프로세스로 로컬 소켓을 통해 넘긴다.
4. 다시 child 프로세스에서 `pickle`모듈을 이용하여 바이너리 데이터를 Python 오브젝트로 바꾼다.
5. `gcd` 함수를 포함하고 있는 Python 모듈을 임포트한다.
6. child 프로세스에서 주어진 인풋에 대해 함수를 병렬로 처리한다.
7. 결과를 바이트로 시리얼라이즈한다.
8. 소켓을 통해 데이터를 다시 돌려 받는다.
9. 부모 프로세스에서 바이너리 데이터를 다시 Python 오브젝트로 디시리얼라이즈한다.
10. 각 child 프로세스에서 작업한 결과를 합친다.

간단해 보이지만 `multiprocessing`모듈로 직접 작업하려면 꽤나 많은 작업이 필요하다. `ProcessPoolExecutor`는 이런 작업들을 줄여준다.

쓰레드간의 통신은 atomic 연산이지만, 시리얼라이즈와 디시리얼라이즈에서 오버헤드가 있다. 따라서 병렬작업을 수행하고자 할 때에는 최대한 적은 데이터를 넘겨주도록 한다.

만약 그렇게 하지 못하는 경우에는 오히려 더 느려질 수도 있다. `multiprocessing` 모듈에서 shared-memory, cross-process lock, queue, proxy 등을 제공하긴 하지만 사용하기 복잡하다. 한 프로세스에서 여러 쓰레드들의 메모리 공유도 복잡한데, 프로세스간에는 더 복잡하고 이해하기 어렵다.

그러므로, `multiprocessing` 모듈의 기능을 바로 모두 사용하고자 하기 보다는, `ThreadPoolExecutor`와 `ProcessPoolExecutor`를 먼저 사용하고, 나중에 `multiprocessing` 모듈을 직접 사용하는 것을 고려하라.

- 멀티코어를 활용한 분산처리를 위해서 C 코드를 작성해 멀티쓰레딩 할 수 있다.
- `multiprocessing` 모듈로 멀티프로세싱하여 병렬 수행할 수 있다.
- 하지만 `multiprocessing`의 기능을 바로 사용하는 것은 매우 복잡하므로 가능한 지양한다.
- `concurrent.futures` 모듈의 `ProcessPoolExecutor`로 `multiprocessing`을 쉽게 사용할 수 있다.


<br/>
-----
<br/>


## Chapter 6. Built-in Modules

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


<br/>
-----
<br/>


## Chapter 7. Collaboration

### 49. Write Docstrings for Every Function, Class, and Module

- 선언문 바로 다음에 docstring을 넣으면, `__doc__` 어트리뷰트로 볼 수 있다.
- docstring은 함수, 클래스, 모듈에 넣을 수 있다.
- docstring은 interactive 개발을 쉽게 한다. `help`함수를 통해 사용법을 확인하면서 개발할 수 있다.
- [Sphinx](http://sphinx-doc.org)과 같은 툴을 이용해 HTML과 같은 다른 포맷으로 변환할 수 있다. 또는 [Read the Docs](https://readthedocs.org) 같은 사이트에서 변환되어 예쁘게 출력된 도큐먼트를 볼 수 있다.
- Python 커뮤니티에서는 documentation을 중요하게 생각한다.

#### Documenting Modules

각 모듈은 top-level docstring을 가져야 한다. 소스파일에서 처음 등장하는 문자열로, 세개의 큰따옴표로 시작하도록 한다. 모듈과 그 내용을 소개한다.

docstring의 첫번째 줄에는 모듈의 목적을 간단히 소개한다. 다음 문단은 사용자가 알아야 할 모듈의 작동을 설명한다. 다음으론 중요한 클래스나 함수들을 강조한다.

```python
# words.py
#!/usr/bin/env python3
"""Library for testing words for various linguistic patterns.

Testing how words relate to each other can be tricky sometimes!
This module provides easy ways to determine when words you've
found have special properties.

Available functions:
- palindrome: Determine if a word is a palindrome.
- check_anagram: Determine if two words are anagrams.
"""
```

만약 모듈이 커맨드라인 유틸리티라면, 커맨드라인에서 사용하는 설명을 넣도록 하자.

#### Documenting Classes

각 클래스는 class-level docstring을 가져야한다. 모듈의 docstring과 비슷한 방식으로 작성하면 된다. 첫번째 줄에는 한줄로 클래스의 목적을 설명하고, 다음 문단에는 클래스의 동작에 대해서 중요한 점을 기술한다. 중요한 public 어트리뷰트나 메소드도 언급한다. 서브클래스가 protected 어트리뷰트와 메소드를 잘 조작할 수 있도록 가이드도 제공해야한다.

```python
class Player(object):
    """Represents a player of the game.

    Subclasses may override the 'tick' method to provide
    custom animations for the player's movement depending
    on their power level, etc.

    Public attributes:
    - power: Unused power-ups (float between 0 and 1)
    - coins: Coins found during the level (integer)
    """
    # ...
```

#### Documenting Functions

각 public 함수들도 docstring이 있어야 한다. 모듈과 클래스와 같은 방식으로 작성하면 된다. 첫번째 줄은 함수가 무엇을 하는지를 한줄로 기술하고, 다음 문단에는 특정 동작이나 아규먼트에 대해 설명한다. 어떤 값을 반환하는지도 언급해야한다. 발생할 수 있는 예외도 설명한다.

```python
def find_anagrams(word, dictionary):
    """Find all anagram for a word.

    This function only runs as fast as the test for
    membership in the 'dictionary' container. It will
    be slow if the dictionary is a list and fast if
    it's a set

    Args:
        word: String of the target word.
        dictionary: Container with all strings that
            are known to be actual words

    Returns:
        List of anagrams that were found. Empty if
        none were found.
    """
    # ...
```

- 아규먼트가 없고, 간단한 값을 반환할 때에는 한줄로 표현해도 충분하다.
- 반환값이 없을 때엔 반환값에 대한 언급을 하지 않아도 된다.
- 일반적인 작업에서 예외를 발생시키지 않는다면 예외에 대한 언급은 없어도 된다.
- 아규먼트의 갯수가 유동적이거나 keyword 아규먼트를 받는다면, `*args`와 `**kwargs`를 아규먼트를 설명하는 리스트에 포함시키고 그 목적을 설명한다.
- 기본값이 있는 아규먼트가 있을 때엔 언급해야한다.
- 함수가 제너레이터인 경우에는 어떤 값을 yield하는지를 설명해야한다.
- 함수가 coroutine인 경우에는 어떤 값을 yield하는지, 어떤 값을 받는지, 언제 이터레이션이 끝나는지를 알려야한다.



docstring을 쓰고 나면 제때 업데이틀 해주어야한다. `doctest` 모듈은 docstring에 내재된 사용예를 연습해서 소스코드와 도큐멘테이션이 유효한지 검증하는 것을 도와준다.



### 50. Use Packages to Organize Modules and Provide Stable APIs

Python의 패키지는 `__init__.py`라는 빈 파일을 가진 디렉토리로 정의된다. 이 파일이 있으면, 파일 내의 모듈들은 상대경로로 임포트 될 수 있다. 패키지 내에 패키지가 있는 것도 허용한다.

(특별히 Python3.4에는 *namespace package*라고 하여 패키지를 더 유연하게 정의할 수 있다. 다른 디렉토리나 zip 파일, 또는 심지어 원격 시스템까지 한 패키지로 묶을 수 있다. [PEP420](http://www.python.org/dev/peps/pep-0420/)에서 namespace package에 대한 자세한 내용을 볼 수 있다.)

Python 프로그램에서 패키지는 두가지 중요한 목적이 있다.

#### Namespaces

첫째로는 모듈들을 namespace로 나눌수 있다는 것이다. 따라서 경로만 다르면 파일이름이 같아도 괜찮다. 하지만 모듈 내의 함수, 클래스, 패키지 안의 서브모듈 이름이 같으면 문제될 수 있다. 서로 다른 경로의 모듈에서 같은 이름을 임포트하면 나중에 임포트 한 것으로 덮어쓴다. 이럴 때엔 `as`를 이용하여 재명명한다. `from`을 사용하지 않고 임포트하여 매번 전체 경로를 명시하며 사용하면 읽을 때 더 명확한 코드가 된다.

```python
# main.py
from analysis.utils import inspect
from frontend.utils import inspect  # 덮어쓴다.

from analysis.utils import inspect as analysis_inspect  # as로 재명명한다.
from frontend.utils import inspect as frontend_inspect

import analysis.utils
analysis.utils.inspect()  # 절대경로로 사용한다.
```

#### Stable APIs

둘째로, 패키지를 통해 외부 사용자에게 견고하고 안정된 API를 제공할 수 있다. 외부 사용자에게 영향을 미치지 않으면서 내부를 수정할 수 있게 하려면, 내부 코드 구조를 외부 사용자가 볼 수 없게 숨겨놓아야한다. Python에서는 모듈이나 패키지의 `__all__`이라는 어트리뷰트에서 노출 정도를 정할 수 있다. `from foo import *`과 같이 임포트하면, `foo.__all__`에 나열된 어트리뷰트만 임포트된다. 만약 `__all__`이 비어있다면, 언더스코어가 없는 public 어트리뷰트가 모두 임포트된다.

움직이는 물체의 충돌을 계산하는 패키지가 있다고 하자.

```python
# models.py
__all__ = ['Projectile']

class Projectile(object):
    def __init__(self, mass, velocity):
        # ...
```

```python
# utils.py
from . models import Projectile

__all__ = ['simulate_collision']

def _dot_product(a, b):
    # ...

def simulate_collision(a, b):
    # ..
```

이 패키지에서 public인 것들을 모두 `mypackage` 모듈에서 제공해보자. 그렇게 하면 이 패키지의 사용자들은 `mypackage.models`나 `mypackage.utils`과 같이 상세 경로를 명시하지 않고도 각 오브젝트를 사용할 수 있다.

`mypackage` 모듈의 `__init__.py` 파일을 다음과 같이 수정한다. 이 파일은 `mypackage`가 임포트 되었을 때 임포트되는 것들을 담고 있는데, 여기에 하위 모듈의 모든 것들을 추가하면 된다.

```python
# __init__.py
__all__ = []
from . models import *
__all__ += models.__all__
from . utils import *
__all__ += utils.__all__
```

사용자는 다음과 같이 사용할 수 있다.

```python
# api_consumer.py
from mypackage import *
a = Projectile(1.5, 3)
b = Projectile(4, 1.7)
after_a, after_b = simulate_collision(a, b)
```

`__all__`에 명시되지 않은 언더스코어로 시작하는 내부용 함수들은 임포트되지 않는다.

직접 만든 모듈들 간의 API를 구성할 때에 `__all__`은 불필요하며, 사용하지 말아야한다. 패키지로 namepace는 여러 사람이 많은 양의 코드를 협업할 때 사용되는 것으로 족하다.

##### Beware of import *

와일드카드로 임포트하는건 콘솔에서 사용하는 경우에는 유용하지만 코드에서는 코드를 이해하기 어렵게한다. 와일드카드로 임포드된 모듈이 많은 경우, 실제로 임포트 된 것들이 어디서 왔는지 파악하기 어려우며, 같은 이름일때 덮어쓰기 되는 것도 알기 어렵다. 그러므로 왠만하면 `from x import y`와 같이 명시해서 임포트하도록 한다.

- 패키지는 여러 모듈을 포함하고, 파일명이 같이도 구분할 수 있는 namespace가 된다.
- 패키지는 `__init__.py` 파일을 디렉토리에 안에 포함하는것으로 정의된다. 패키지 안에 패키지가 있을 수 있다.
- `__all__`에 노출시킬 어트리뷰트를 나열해서 명시적인 API를 제공할 수 있다.
- `__init__.py`에 노출시킬 어트리뷰트들만 넣거나, 내부용 멤버에 언더스코어를 앞에 달아서 노출을 막을 수 있다.
- 한 팀만 작업하거나, 하나의 코드를 사용할 때에는 `__all__`은 불필요하다.



### 51. Define a Root `Exception` to Insulate Callers from APIs

`ValueError`와 같은 일반적인 Exception을 발생시키기 보다는, API 내에 Root Exception을 정의하고 이를 상속하여 내부적인 Exception들을 만들어 사용하라. 내부에도 상속구조를 만들어 사용하면, 나중에 새로운 Exception을 추가하거나 변경하기 용이하다.

```python
class Error(Exception):  # 내가 만든 API에서 사용할 Root Exception
    """Base-class for all exceptions raised by this module."""

class DensityError(Error):  # Density 관련 연산에서 사용할 Intermediate Exception
    """Base-class for density calculation errors"""

class InvalidDensityError(DesityError):  # Density의 값과 관련된 일종의 ValueError
    """There was a problem with a provided density value."""

class NegativeDensityError(InvalidDensityError):  # Desity가 음수이면 발생하는 ValueError
    """A provided density value was negative"""

def determine_weight(volume, density):
    if density <= 0:
        # raise ValueError('Density must be positive')  # 일반적인 ValueError를 사용하는 경우
        raise NegativeDensityError('Density must be positive')  # 커스텀 Exception

try:
    weight = my_module.determine_weight(1, -1)
except my_module.NegativeDensityError as e:
    raise ValueError('Must supply non-negative density') from e
except my_module.InvalidDensityError:
    weight = 0
except my_module.DensityError as e:
    logging.error('Bug realted with density calculation: %s', e)
except my_module.Error as e:  # 이 예외처리를 통해 API의 모든 에러를 관리할 수 있다.
    logging.error('Bug in the calling code: %s', e)
except Exception as e:  # 만약 이 로그가 남는다면 API 내부에서 예상치 못한 에러가 발생한 것이다.
    logging.error('Bug in the API code: %s', e)
    raise
```

- Root Exception을 사용하면 사용자가 API를 더 잘 이해할 수 있다. `except my_module.Error`를 통해 API에서 발생할 수 있는 예외를 모두 처리할 수 있으며, 만약 API를 잘 사용하지 못하더라도 나중에 `except Exception` 구문에서 API에서 에러가 발생했다는 것을 알 수 있다.
- Root Exception을 사용하면 내 코드의 버그를 쉽게 찾을 수 있다. 만약 `except my_module.Error`에 걸리지 않고 `except Exception` 구문이 동작했다면, 의도치 않은 에러가 발생했다는 것이다.
- Root Exception과 Intermediate Exception을 적절히 사용하면, 나중에 Exception을 추가하거나 변경했을때 외부 영향을 줄일 수 있다. `NegativeDensityError`를 나중에 추가했다 하더라도, `except InvalidDensityError`에서 예외처리 될 것이고, 사용자는 나중에 `except NegativeDensityError` 구문을 추가할 수 있을 것이다.



### 52. Know How to Break Circular Dependencies

모듈들이 서로를 임포트 하는 경우가 생길 수 있다. 다음 예를 보자.

```python
# dialog.py
import app

class Dialog(object):
    def __init__(self, save_dir):
        self.save_dir = save_dir
    # ...

save_dialog = Dialog(app.prefs.get('save_dir'))

def show():
    # ...
```

파일을 저장하기 위한 다이얼로그가 있는데, 이 다이얼로그는 `app.prefs`에서 기본값을 불러온다.

```python
# app.py
import dialog

class Pref(object):
    # ...
    def get(self, name):
        # ...

prefs = Prefs()
dialog.show()
```

`app` 모듈은 `Pref` 클래스를 정의하고 인스턴스 `prefs`를 가진다. 그리고 `dialog.show`를 호출한다.

이와 같은 경우에 만약 메인 프로그램에서 `app`모듈을 사용하려고하면 다음과 같은 에러가 발생한다.

```
Trackback (most recent call last):
  File "main.py", line 4, in <module>
    import app
  File "app.py", line 4, in <module>
    import dialog
  File "dialog.py", line 16, in <module>
    save_dialog = Dialog(app.prefs.get('save_dir'))
AttributeError: 'module' object has no attribute 'prefs'
```

`main` 모듈이 `app` 모듈을 임포트 하는데, `app`모듈은 `dialog`모듈을 임포트 하므로 `dialog`모듈이 수행되는데, `dialog`모듈이 `app`모듈에 있어야 할 어트리뷰트인 `prefs`를 찾지 못하는 상황이다.

Python이 어떻게 모듈들을 임포트하는지를 보면, 왜 이런 상황이 발생하는지 이해할 수 있다. Python은 `import`를 만나면 깊이 우선으로 탐색한다.

- `sys.path`에서 모듈을 찾는다.
- 모듈에서 코드를 불러오고 컴파일되는지 확인한다.
- 모듈에 해당하는 비어있는 오브젝트를 생성한다.
- 모듈을 `sys.modules`에 넣는다. 여기서부터 임포트가 가능하다. 하지만 오브젝트가 비어있으므로 사용할 수 없다.
- 모듈의 코드를 실행시켜, 모듈 오브젝트가 그 내용(어트리뷰트 등)을 갖게 한다. 이제 사용할 수 있다.

위 상황에서는 `main`이 `app`을 임포트하고, `app`이 `dialog`를 임포트하고, `dialog`가 `app`을 임포트하는 것 까지는 정상적으로 수행된다. 왜냐하면 `app`이 `import dialog`를 만나기 전까지, 즉 4번 단계까지는 마쳐있는 상태기 때문이다. 하지만 5번 단계를 거치지 않았기 때문에 `Pref` 클래스나 `prefs` 어트리뷰트는 정의되지 않은 상태이다. 이제 `dialog`는 다른 `import` 구문을 만나지 않고 5번 단계를 밟는데, `app.prefs`가 정의되지 않아서 `AttiributeError`가 나는것이다.

- 상호 의존성이 있는 부분은 별도의 의존성 트리에서 최하위 모듈로 빼는 것이 가장 좋은 방법이다.

하지만 그러지 못할 때에는 다음과 같은 대략 세가지 방법으로 해결할 수 있다.

#### Reordering Imports

단순히 `prefs = Prefs()`가 `import dialog` 전에 수행되도록 위치를 바꾸어주면 된다.

```python
# app.py
class Pref(object):
    # ...

prefs = Prefs()

import dialog  # 나중에 import한다.
dialog.show()
```

 하지만 이 방법은 PEP8 가이드에 위배되며, 전체 모듈이 코드 순서에 의해 무너질 위험이 있다.

#### Import, Configure, Run

`prefs`를 사용하는 부분을 별도의 함수(`configure`)로 빼서, 5번 단계에서 직접적으로 접근되지 않도록 하는 방법이 있다.

```python
# dialog.py
import app

class Dialog(object):
    # ...

save_dialog = Dialog()  # prefs를 사용하지 않는다.

def show():
    # ...

def configure():  # 별도의 함수를 만들어두고, 런타임에 app.prefs에 접근하도록 미룬다.
    save_dialog.save_dir = app.prefs.get('save_dir')
```

```python
# app.py
import dialog

class Prefs(object):
    # ...

prefs = Prefs()

def configure():  # dialog를 사용하는 부분은 configure함수로 빼둔다.
    # ...
```

```python
# main.py
import app
import dialog

app.configure()     # 이 시점에서 app과 dialog모듈은 5번 단계를 모두 수행한 상태이다.
dialog.configure()  # 따라서 configure함수가 실행되어도 서로의 모듈 어트리뷰트에 접근할 수 있다.

dialog.show()
```

이와 같은 방법은 잘 동작하며, *dependency injection* 패턴을 가능하게한다. 즉 디펜던시가 있는 부분은 나중에(런타임에) 주입해서 사용할 수 있다. 하지만, `configure` 단계로 뺄 수 있도록 구조화 하는 작업이 어려울 수 있다. 또, 모듈에 추가적인 단계가 생기고 오브젝트의 정의와 설정이 분리되어 이해하기 어려울 수 있다.

#### Dynamic Import

- 마지막으로 가장 간단한 방법은, *dynamic import*라고 불리는 메소드나 함수 내에서 필요할 때 임포트하는 방법이다.

디펜던시가 있는 부분이 5단계를 거칠때 까지 실제로 수행되지 않도록 하고 나중에 실제로 실행되게 만든다는 점에서 앞 방법과 비슷하지만 구조 변경이 필요 없다.

```python
# dialog.py
class Dialog(object):
    # ...

save_dialog = Dialog()

def show():
    import app  # Dynamic import
    save_dialog.save_dir = app.prefs.get('save_dir')
```

일반적으로는 dynamic import도 사용하지 않는 편이 낫다. 임포트 작업에 오버헤드가 있고, 임포트 작업을 뒤로 미루기 때문에 런타임에 `SyntaxError`와 같은 예기치못한 에러가 날 수 있기 때문이다. 하지만 여전히 이 방법이 전체 코드를 재구성하는 방법들 보다 낫다.



### 53. Use Virtual Environments for Isolated and Reproducible Dependencies

여러 모듈이 서로 다른 버전에 대한 의존성이 있을 수 있다. Python은 글로벌하게 모듈관리를 하기 때문에, 같은 모듈에 대해 다른 버전을 두개 설치할 수 없는데, 이때문에 문제가 생길 수 있다. 예를들어 `Sphinx`  모듈과 `flask` 모듈은 모두 `Jinja2` 모듈에 디펜던시가 있는데, `pip install —-upgrade`로  `Jinja2`를 업그레이드 했을때, 아직 구 버전에 디펜던시가 있는 모듈이 동작하지 않을 수도 있다.

여러 사람이 서로 다른 컴퓨터에서 독립된 횐경에서 작업하기 위해서는 가상환경을 이용해야한다. Python2에서는 `virtualenv`를 이용하여 가상환경을 구성하지만, Python3.4부터는 `pyvenv`가 기본적으로 제공되어 `python -m vent`로 가상환경을 구성할 수 있다.

```shell
# 글로벌 환경
$ which python3
/usr/local/bin/python3
# 가상환경 구성
$ pyvenv /tmp/myproject
$ cd /tmp/myproject
$ ls
bin    include    lib    pyvenv.cfg
# 가상환경 활성화
$ source bin/activate
(myproject)$ which python3
/tmp/myproject/bin/python3  # Python3 패스가 바뀐다.
# 가상환경 비활성화
(myproject)$ deactivate
$ which python3
/usr/local/bin/python3      # 다시 글로벌 환경의 Python3을 가리킨다
```

가상환경에서 `pip`로 설치한 목록을 추출하고, 재현하기 위해서는 다음과 같이 한다.

```shell
# 설치된 패키지 목록을 추출하기
(myproject)$ pip3 freeze > requirements.txt
(myproject)$ head requirements.txt
numpy (1.8.2)
pip (1.5.6)
pytz (2014.4)
# 패키지 목록으로 다시 설치하기
(otherproject)$ pip3 install -r /tmp/myproject/requirments.txt
(otherproject)$ pip3 list
numpy (1.8.2)
pip (1.5.6)
pytz (2014.4)
...
```

문제는 가상환경을 사용하는 폴더를 옮기거나 변경하면, 내부의 패스가 꼬여버려 동작하지 않는다는 것이다. 가상환경을 사용하는 이유가 쉽게 환경을 재현하는 것이니, 그럴 땐 가상환경을 새로 구성하고 설치하도록 하자.


<br/>
-----
<br/>


## Chapter 8. Production

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
