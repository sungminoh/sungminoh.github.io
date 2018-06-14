---
layout: post
title:  "[Effective Python] 7. Collaboration"
tags: python
---



## 7. Collaboration

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
