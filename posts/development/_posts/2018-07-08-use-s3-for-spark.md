---
layout: post
title: "스파크(Spark)에서 S3 이용하기"
tags: [spark, aws]
img: spark-s3.png
---

## 스파크 설치

스파크를 다운로드한다 (https://spark.apache.org/downloads.html)

```sh
curl http://mirror.apache-kr.org/spark/spark-2.3.0/spark-2.3.0-bin-hadoop2.7.tgz | tar xzf -
```

<br/>


원하는 경로로 옮기고 적절한 링크를 생성한다. (`opt/spark` 또는 `/usr/lib/spark` 마음대로)

```shell
sudo mv spark-2.3.0-bin-hadoop2.7 /usr/local/
sudo ln -s /usr/local/spark-2.3.0-bin-hadoop2.7 /usr/local/spark
```

<br/>


spark executable들을 커맨드로 사용할 수 있도록 등록한다.

```shell
find /usr/local/spark/bin/ -executable -type f -exec sudo ln -s '{}' /usr/local/bin/ \;
find /usr/local/bin/ -executable -type l | awk '{print substr($0, index($0, $9))}'
```

>```
>beeline -> /usr/local/spark/bin/beeline
>docker-image-tool.sh -> /usr/local/spark/bin/docker-image-tool.sh
>find-spark-home -> /usr/local/spark/bin/find-spark-home
>pyspark -> /usr/local/spark/bin/pyspark
>run-example -> /usr/local/spark/bin/run-example
>spark-class -> /usr/local/spark/bin/spark-class
>sparkR -> /usr/local/spark/bin/sparkR
>spark-shell -> /usr/local/spark/bin/spark-shell
>spark-sql -> /usr/local/spark/bin/spark-sql
>spark-submit -> /usr/local/spark/bin/spark-submit
>```


<br/>


`spark-shell` 을 실행시켜봐도, 자바를 설치하지 않았으므로 사용할 수 없다.

```shell
spark-shell
```

>```
>/usr/local/bin/spark-class: line 24: /usr/local/bin/load-spark-env.sh: No such file or directory
>JAVA_HOME is not set
>```

```shell
java
```

> ```
> The program 'java' can be found in the following packages:
>  * default-jre
>  * gcj-5-jre-headless
>  * openjdk-8-jre-headless
>  * gcj-4.8-jre-headless
>  * gcj-4.9-jre-headless
>  * openjdk-9-jre-headless
> Try: sudo apt install <selected package>
> ```


<br/>


하지만 자바를 설치하고 `spark-shell`을 실행해봐도 안된다.

```shell
sudo apt-get install default-jre -y
spark-shell
```

>```
>/usr/local/bin/spark-class: line 24: /usr/local/bin/load-spark-env.sh: No such file or directory
>Failed to find Spark jars directory (/usr/local/assembly/target/scala-/jars).
>You need to build Spark with the target "package" before running this program.
>```


<br/>


`SPARK_HOME` 을 등록해준다

```shell
echo "export SPARK_HOME=/usr/local/spark" >> ~/.bashrc; source ~/.bashrc
spark-shell
```

>```
>2018-06-06 02:45:29 WARN  NativeCodeLoader:62 - Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
>Setting default log level to "WARN".
>To adjust logging level use sc.setLogLevel(newLevel). For SparkR, use setLogLevel(newLevel).
>Spark context Web UI available at http://ip-12-345-67-890.ap-northeast-2.compute.internal:4040
>Spark context available as 'sc' (master = local[*], app id = local-1528253140612).
>Spark session available as 'spark'.
>Welcome to
>      ____              __
>     / __/__  ___ _____/ /__
>    _\ \/ _ \/ _ `/ __/  '_/
>   /___/ .__/\_,_/_/ /_/\_\   version 2.3.0
>      /_/
>
>Using Scala version 2.11.8 (OpenJDK 64-Bit Server VM, Java 1.8.0_171)
>Type in expressions to have them evaluated.
>Type :help for more information.
>
>scala>
>```
>


<br/>


이제 pyspark 를 실행하거나, python 콘솔을 띄우거나, ipython을 띄우거나, 스크립트를 작성하거나 해서 다음 코드를 돌려보자.

```python
from pyspark import SparkContext, SQLContext
sqlc = SQLContext(SparkContext())
sqlc.read.orc('s3://bucket/filepath')
```

> ```
> Py4JJavaError: An error occurred while calling o62.orc.
> : java.lang.RuntimeException: java.lang.ClassNotFoundException: Class org.apache.hadoop.fs.s3a.S3AFileSystem not found
> ...
> Caused by: java.lang.ClassNotFoundException: Class org.apache.hadoop.fs.s3a.S3AFileSystem not found
> ...
> ```

S3A file system을 찾지 못해 s3에 있는 데이터를 읽어오지 못한다.


<br/>
<br/>


## Spark 에서 S3 사용하기

[Java용 AWS SDK](https://aws.amazon.com/ko/sdk-for-java/)를 다운로드한다.

```shell
sudo apt-get install unzip
wget https://sdk-for-java.amazonwebservices.com/latest/aws-java-sdk.zip
unzip aws-java-sdk.zip
```


<br/>


필요한 jar를 적당한 경로로 옮긴다. (버전에 따라 파일명이 달라질 수 있다.)

```shell
sudo mv aws-java-sdk-1.11.342/lib/aws-java-sdk-1.11.342.jar /usr/local/spark
```

<br/>


[하둡 AWS jar](https://talend-update.talend.com/nexus/content/repositories/libraries/org/talend/libraries/hadoop-aws-2.7.3-amzn-2/6.0.0/)도 다운받는다.

```shell
wget https://talend-update.talend.com/nexus/content/repositories/libraries/org/talend/libraries/hadoop-aws-2.7.3-amzn-2/6.0.0/hadoop-aws-2.7.3-amzn-2-6.0.0.jar
```


<br/>


적당한 경로로 옮긴다

```shell
sudo mv hadoop-aws-2.7.3-amzn-2-6.0.0.jar /usr/local/spark/
```


<br/>


이제 다음과 같이 configure를 주면, S3에서 데이터를 읽어온다.

```python
from pyspark import SQLContext, SparkContext, SparkConf
conf = SparkConf().setAll([('spark.driver.extraClassPath', '/usr/local/spark/hadoop-aws-2.7.3-amzn-2-6.0.0.jar:/usr/local/spark/aws-java-sdk-1.11.342.jar')])
sc = SparkContext(conf=conf)
sqlc = SQLContext(sc)
df = sqlc.read.text('s3a://my-bucket/path/to/my/data')
```


<br/>


매번 configure를 주는게 귀찮다면, `$SPARK_HOME/conf/spark-defaults.conf` 를 생성한다.

```
spark.master                     local
spark.driver.extraClassPath      /usr/local/spark/hadoop-aws-2.7.3-amzn-2-6.0.0.jar:/usr/local/spark/aws-java-sdk-1.11.342.jar
```


<br/>
<br/>


- EC2에서 사용하는거라면, 별도의 AWS_ACCESS_KEY_ID, AWS_SECRET_KEY 등을 설정할 필요가 없다.

- 머신 한대에서 사용할 거라면 hadoop도 없어도 되고, 하둡이나 얀 관련한 환경설정도 필요없다.
- spark, aws java sdk, hadoop aws jar 이 셋만 준비하자.
