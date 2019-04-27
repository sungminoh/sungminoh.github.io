---
layout: post
title:  "스태틱 클래스 테스트하기"
tags: java
img: mockito.png
hide_img: True
---
테스트 코드는 한 메소드만 테스트 하는 것이 좋지만, 해당 메소드가 다른 메소드를 사용하거나 할 때에는 어디까지 고려를 해야할지 애매할 때가 많다. 다음 예시를 보자

```java
public static class Foo {
  public static Double getMax(List<Double> numbers) {}
  public static Double getMin(List<Double> numbers) {}
  public static List<Double> normalize(List<Double> numbers) {
    double max = getMax();
    double min = getMin();
    return numbers.stream()
      .map(n -> n / (max - min))
      .collect(Collectors.toList());
  }
}
```

위 코드에서 `normalize` 메소드를 테스트 하고 싶다면, `getMax`, `getMin`이 무엇을 리턴할지까지 고려해서 테스트코드를 짜야할까? 답은 사실 간단하다. 만약 `normalize` 메소드 하나를 테스트하기 위해 다른 메소들까지 제대로 된 값을 내놓는지 테스트 함께 하게 되면, 다른 메소드들의 로직이 바뀌었을 때 마다 `normalize` 의 테스트코드도 수정해 줘야 할 수도 있다.

<br/>

<br/>

<br/>

테스트코드에서 메소드간의 의존성을 제거하기 위해 흔히 사용하는 프레임워크로는 [mockito](https://site.mockito.org/) 가 있다. mockito의 `mock` 메소드를 사용하면, 인스턴스가 하나 주어지는데, `when` 메소드를 사용하면 이 인스턴스의 메소드 콜의 결과 값을 overwrite할 수 있다.(method stub 라고 한다.) 이렇게 가짜 인스턴스를 만들면 테스트하고자 하는 클래스에 인젝션하거나(db connection, file system등의 테스트), 해당 클래스의 다른 메소드(subrutine을 갖는 메소드)를 좀 더 쉽게 테스트 할 수 있다.

```java
mport static org.mockito.Mockito.*;
// mock creation
List mockedList = mock(List.class);
when(mockedList.get(any())).thenReturn("first");
// using mock object - it does not throw any "unexpected interaction" exception
mockedList.add("one");
mockedList.clear();
// selective, explicit, highly readable verification
verify(mockedList).add("one");
verify(mockedList).clear();
// mock method acts as we defined
assertEquals("first", mockList.get(0));
```

<br/>

Spring 에서도 그렇고 많은 경우 자바에서는 static 클래스 보다는 singleton 패턴을 사용하기에 대부분의 경우에는 mockito로도 무리없이 테스트코드를 작서할 수 있지만, 때때로 static 클래스를 사용해야 할 때가 있다. 만약 앞에 예로든 `Foo` 의 메소드를 테스트 하기 위해서는 어떻게 해야할까?

```java
Foo foo = mock(Foo.class);  // ???
```

<br/>

<br/>

<br/>

mockito의 api중에서는 쓸만한 것이 딱히 없고, 아래와 같이 직접 mock 클래스를 구현해서 테스트 할 수 있을텐데, 조작하고자 하는 메소드 조합에 따라 모두 이런 클래스를 만들 순 없을 것이다.

```java
public static class MockFoo() extends Foo {
  private static Double getMax() {
    return 3;
  }
}
```



그래서 이럴때 mockito처럼 사용할 수 있는 것이 있는데 그게 바로 powermockito이다. 아래와 같이 의존성을 추가하면 powermockito를 사용할 수 있다.

```java
testCompile group: 'org.powermock', name: 'powermock-api-mockito', version: '1.7.3'
```



하지만 이건 mockito처럼 단순하게 사용할 수 없고, 테스트 클래스에 `@RunwWith(PowerMockRunner.class)` 와 stub 하고자 하는 클래스를 인자로 준 `@PrepareForTest({Foo.class, AnotherClassToMock.class})` 어노테이션을 달아주어야한다. 몇몇 에러를 무시하고 싶다면 `@PowerMockIgnore({}) ` 를 사용할 수 있다.

```java
@RunWith(PowerMockRunner.class)  // These two lines are
@PrepareForTest({Foo.class, UserGroupInformation.class})  // what is necessary
@PowerMockIgnore({"javax.management.*", "javax.xml.", "org.w3c.", "org.apache.apache._", "com.sun.*"})  // This isn't. This is to ignore some errors
public class FooTest {
  public void normalizeTest() {
  	// Stub all methods. The others will return null or a default value.
    PowerMockito.mockStatic(Foo.class);
    Mockito.when(UserGroupInformation.getMax()).thenReturn(3);

    // Mock a method and leave the others.
    PowerMockito.spy(Foo.class);
    PowerMockito.doReturn(2.).when(Foo.class, "getMax");
    PowerMockito.doReturn(1.).when(Foo.class, "getMin");

    // To test the result
    assertEquals(Array.asList(1., 3., 5.), Foo.normalize(Array.asList(1., 3., 5.)));
    // To count the number of method calls
    PowerMockito.verifyStatic(Mockito.times(1));
		Foo.getMax(Mockito.any());
		Foo.getMin(Mockito.any());
  }
}
```

`mockStatic` 는 클래스의 모든 메소드를 바꾸어 버리므로 `when` 을 통해 명시 하지 않은 메소드들은 `null`이나 기본값을 리턴하는 것에 유의해야한다. 특정 메소드만 stub하고 나머지 메소드는 그대로 사용하고 싶다면 `spy` 를 만들어 `doReturn` 구문을 통해 리턴값을 변경하여야 한다.

서브루틴의 콜횟수를 검증하고 싶다면 `verifyStatic` 을 사용하는데, 이 메소드는 인자로 메소드를 받지 않고 횟수만 받으며, 그 이후에 나오는 메소드 콜들의 호출휫수를 검증한다.

<br/>

<br/>

<br/>

다만 powermockito를 사용할 때 문제가 있는데 만약 테스트코드에서 스파크를 사용한다면 `SparkContext` 를 생성할 때 아래와 같은 에러가 발생할 것이다.

```java
java.io.IOException: failure to login
    at org.apache.hadoop.security.UserGroupInformation.loginUserFromSubject(UserGroupInformation.java:796)
    at org.apache.hadoop.security.UserGroupInformation.getLoginUser(UserGroupInformation.java:748)
    at org.apache.hadoop.security.UserGroupInformation.getCurrentUser(UserGroupInformation.java:621)
    at org.apache.spark.util.Utils$$anonfun$getCurrentUserName$1.apply(Utils.scala:2162)
    at org.apache.spark.util.Utils$$anonfun$getCurrentUserName$1.apply(Utils.scala:2162)
    at scala.Option.getOrElse(Option.scala:120)
    at org.apache.spark.util.Utils$.getCurrentUserName(Utils.scala:2162)
    at org.apache.spark.SparkContext.<init>(SparkContext.scala:301)
```

이건 `@RunWith` 어노테이션 때문에 발생하는 일인데, 이 어노테이션은 꼭 필요하므로 차라리 문제가 발생하는 부분을 추가적으로 mocking하는 편이 낫다.

에러를 잘 따라가보면, `SparkContext` 에서 user를 가져오기 위해 `UserGroupInformation.getCurrentUser` 를 호출하는데, 여기서 에러가 나는 것을 알 수 있다. 아래와 같이 이 메소드를 stub한다면 `SparkContext` 가 정상적으로 생성될 것이다.

```java
UserGroupInformation mock = PowerMockito.mock(UserGroupInformation.class);
PowerMockito.when(mock.getUserName()).thenReturn("tester");
PowerMockito.spy(UserGroupInformation.class);
PowerMockito.doReturn(mock).when(UserGroupInformation.class, "getCurrentUser");
```

