---
layout: post
title:  "Python 싱글톤 패턴"
tags: python
published: true
---

# Python thread-safe singleton

모니터링 서비스 클래스를 구현하다가 파이썬 싱글톤 패턴을 어떻게 구현하는게 좋을지 고민을 해보았다.

Python은 자유도가 높다보니 싱그톤 패턴을 구현하는 방법도 여러가지가 있는데, https://stackoverflow.com/questions/6760685/creating-a-singleton-in-python 이 글이 각 방법을 잘 비교 설명하고 있어 간략히 번역&정리하고, 내 구현을 소개한다.



## Stackoverflow 글

### 1. Decorator

```python
def singleton(class_):
    instances = {}
    def getinstance(*args, **kwargs):
        if class_ not in instances:
            instances[class_] = class_(*args, **kwargs)
        return instances[class_]
    return getinstance

@singleton
class MyClass(BaseClass):
    pass
```

* 장점: 상속 같은거보다 직관적이다
* 단점: 클래스가 decorator로 감싸져서 함수가 되어버린다. 때문에 클래스 메소드에 접근할 수 없다.



### 2 .Base class

```python
class Singleton(object):
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not isinstance(cls._instance, cls):
            class_._instance = super().__new__(cls, *args, **kwargs)
        return class_._instance

class MyClass(Singleton, BaseClass):
    pass
```

* 장점: 클래스다.
* 단점: `MyClass`의 `__new__` 가 계속 호출된다.



### 3. Meta class

```python
class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        else:  # 매번 __init__ 호출하고 싶으면
            cls._instances[cls].__init__(*args, **kwargs)
        return cls._instances[cls]

class MyClass(BaseClass, metaclass=Singleton):
    pass
```

* 장점: 클래스고, 상속 신경쓸 필요없고, 메타클래스의 의미에 들어맞는다. `MyClass`의 `__new__` 는 처음 인스턴스 생성될 때 한번만 호출된다.
* 단점: ABC처럼 다른 meta class를 상속하는 클래스를 상속하지 못한다.



### 4. 그냥 Module 사용

* 장점: 싱글톤 자체가 안티패턴이다. global과 다를바 없으니 그냥 모듈을 사용하자!
* 단점: 상속은? Lazy evaluation은? non-singleton으로 리팩토링 하고싶을때는?



## 그래서..?

이 중에서 3번 방법이 가장 괜찮은 것 같지만, multi thread 환경에서 잘 동작하게 하기 위해서는 추가적인 구현이 필요하다. 또, ABC를 대체할 만한 다른 구현체도 필요하다.

`ABC`는 별 일 하지 않는 `ABCMeta`를 상속한다. 싱글톤 meta class를 구현할 때에도 이 `ABCMeta` 를 상속하여, 하위 클래스가 Abstract class가 될 수 있도록 한다.

```python
class SingletonABCMeta(ABCMeta):
    _instances = {}
    _locks = {}

    def __new__(mcls, name, bases, class_dict):
        module = class_dict['__module__']
        classname = class_dict['__qualname__']
        mcls._locks[f'{module}.{classname}'] = threading.Lock()
        return super().__new__(mcls, name, bases, class_dict)

    def __call__(cls, *args, **kwargs):
        module = cls.__module__
        classname = cls.__name__
        name = f'{module}.{classname}'
        lock = cls._locks[name]
        if cls not in cls._instances:
            try:
                lock.acquire()
                if cls not in cls._instances:
                    cls._instances[cls] = super().__call__(*args, **kwargs)
                    print('Singleton class %r is instantiated', name)
                else:  # To call __init__ every time.
                    cls._instances[cls].__init__(*args, **kwargs)
            except Exception as e:
                raise Exception(f'Fail to instantiate {name}') from e
            finally:
                lock.release()
        return cls._instances[cls]


class SingletonABC(metaclass=SingletonABCMeta):
    pass


class Singleton(SingletonABC):
    pass
```





## 근데 싱글톤 패턴 진짜 써야해?

global 변수는 상태가 공유된다는게 명시적이지만, 싱글톤은 이미 생성된 인스턴스를 재활용함으로써 implicity하게 상태를 공유하는 문제가 있다.

하지만 Constant/Context 처럼 그 자체 의미상 전역에서 공유되어야 하는 상태값들일 때이거나, Logger나 Monitoring Service와 같이 데이터를 흘려보내는 역할만 할 때에는 실제로 상태를 공유한다기보단 동일한 설정을 사용할 뿐이므로 괜찮다고 본다.
