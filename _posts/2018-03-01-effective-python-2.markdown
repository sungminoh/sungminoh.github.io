---
layout: post
title:  "[Effective Python] 2. Functions"
categories: development/python
---



## 2. Functions

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


