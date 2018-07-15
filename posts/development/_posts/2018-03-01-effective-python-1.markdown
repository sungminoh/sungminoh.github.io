---
layout: post
title:  "[Effective Python] 1. Pythonic Thinking"
tags: python
img: effective-python.jpg
published: false
---



## 1. Pythonic Thinking

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


