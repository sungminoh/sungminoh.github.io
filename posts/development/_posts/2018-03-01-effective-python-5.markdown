---
layout: post
title:  "[Effective Python] 5. Concurrency and Parallelism"
tags: python
img: effective-python.jpg
---



## 5. Concurrency and Parallelism

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
