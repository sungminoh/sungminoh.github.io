---
layout: post
title:  "모듈별 로거 사용하기"
tags: python
---


로거를 만들어주는 함수를 따로 작성한다

```python
def get_logger(name, logfile='/dev/null', level=0, stream=False):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    formatter = logging.Formatter('%(asctime)s %(levelname)-5s %(lineno)4s:%(filename)-20s - %(message)s')
    # file handler
    file_handler = logging.FileHandler(logfile)
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    # stream handler
    if stream:
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(level)
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
    # binding
    return logger
```

<br/>

각 모듈의 상단에서 아래와 같이 로거를 생성해 사용한다.

```python
logger = get_logger(__name__)
```


