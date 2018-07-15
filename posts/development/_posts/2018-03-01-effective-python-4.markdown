---
layout: post
title:  "[Effective Python] 4. Metaclasses and Attributes"
tags: python
img: effective-python.jpg
---



## 4. Metaclasses and Attributes

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

