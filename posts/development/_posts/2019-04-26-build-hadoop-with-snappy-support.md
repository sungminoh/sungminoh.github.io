---
layout: post
title:  "로컬 스파크에서 snappy 읽기 (hadoop build)"
tags: spark, hadoop
img: spark.png
hide_img: True
---
하둡에 데이터를 저정할 때에는 저장 공간과 분산처리시의 네트워크 전송 속도를 줄이기 위해 파일을 압축해서 저장하곤 한다.

이때 흔히 사용하는 압축 방식 중 하나로 구글에거 개발한 [snappy](https://github.com/google/snappy)가 있는데, gzip(GNU zip)의 압축률보다는 보다는 못하지만 CPU 사용량이 적고 압축/압축해제에 걸리는 시간이 조금들어 실제 맵리듀스에서 더 나은 성능을 보인다고 한다.

때문에, 많은 분산시스템에서 snappy를 설치하여 압축 저장을 하고 있는데, 문제는 snappy가 없는 환경에서 이 파일을 읽으려고 할 때이다.

<br/>

<br/>

<br/>


맥북에 `brew`로 스파크를 설치하고, snappy 압축된 텍스트파일을 읽어오려 해보자.

```python
sc.textFile('text-data.snappy')
## ERROR
## native snappy library not available: this version of libhadoop was built without snappy support.
```

원래 로컬에서 간단히 스파크를 사용하기 위해서 하둡을 따로 설치할 필요는 없지만, 하둡에서 기본적으로 지원 되지 않는 포멧도 처리하기 위해서는 라이브러리를 추가해주어야한다.

그 라이브러리를 얻기 위해서 위 에러메시지에서 얘기하는대로 snappy support와 함께 하둡을 직접 빌드해보자.

<br/>

<br/>

<br/>

## Install prerequisites

하둡을 빌드하기 위해 필요한 프로그램들을 설치한다.

하둡을 빌드할 땐 2.5.0 버전의 protocbuf가 필요하니, 만약 3.5 버전 등 을 사용하고 있다면 잠시 protoc를 unlink하거나 옮겨두어야한다.

```shell
# Install open ssl
brew install openssl

# Install make and cmake
brew install make
brew install cmake

# Install snappy
brew install snappy

# Download protobuf-2.5.0 must be 2.5.0
wget https://github.com/protocolbuffers/protobuf/releases/download/v2.5.0/protobuf-2.5.0.tar.gz
tar xzf protobuf-2.5.0.tar.gz
# Install protobuf
cd protobuf-2.5.0
./configure
make
make install
```

이제 `/usr/local/bin`에 `protoc`파일이 생기되고, 하둡빌드는 이 바이너리를 이용한다.

<br/>

<br/>

<br/>

## Build hadoop native from the source with snappy support

우선 하둡을 다운로드한다.

```shell
wget http://apache.claz.org/hadoop/common/hadoop-2.7.7/hadoop-2.7.7-src.tar.gz
tar xzf hadoop-2.7.3.tar.gz
cd hadoop-2.7.3-src
```

아래와 같이 필요한 환경변수 설정하고 빌드한다.

```shell

# Exports some env variables
export OPENSSL_ROOT_DIR=/usr/local/opt/openssl
export OPENSSL_LIBRARIES=/usr/local/opt/openssl/lib
# Build
mvn package -Pdist,native -DskipTests -Dtar -e
# Move
mkdir -p /usr/local/Cellar/hadoop/hadoop-2.7.3
cp -R hadoop-dist/target/hadoop-2.7.3/lib /usr/local/Cellar/hadoop/hadoop-2.7.3
```

<br/>

<br/>

<br/>

## Add extra driver library for spark to read snappy file

`$SPARK_HOME/conf/spark-defaults.conf` 에 다음과 같이 `extraLibraryPath` 설정을 추가한다.

```shell
echo 'spark.driver.extraLibraryPath    /usr/local/Cellar/hadoop/hadoop-2.7.3/lib/native' >> $SPARK_HOME/conf/spark-defaults.conf
```





여기까지 하고 다시 snappy 압축 파일을 읽어보면, 성공적으로 데이터를 조회할 수 있을 것이다.