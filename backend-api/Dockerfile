# 使用多阶段构建优化镜像大小
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# 复制 pom.xml 和 Maven Wrapper
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# 下载依赖（利用 Docker 缓存）
RUN ./mvnw dependency:go-offline

# 复制源代码
COPY src ./src

# 构建应用
RUN ./mvnw clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/target/*.jar app.jar

# 创建非 root 用户
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 暴露端口
EXPOSE 8080

# JVM 优化参数
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
