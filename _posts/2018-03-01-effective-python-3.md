---
layout: post
title:  "[Effective Python] 3. Classes and Inheritance"
categories: development/python
---



## 3. Classes and Inheritance

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
