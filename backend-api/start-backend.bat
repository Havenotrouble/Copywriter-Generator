@echo off
set "JAVA_HOME=C:\Users\23732\.jdks\ms-17.0.17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "D:\liziyi\codeprivate\Copywriter-Generator\backend-api"
call mvn clean compile spring-boot:run
