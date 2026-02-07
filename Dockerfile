FROM registry.cn-shenzhen.aliyuncs.com/heitasoft/nginx:stable-alpine3.20

VOLUME /tmp
ENV LANG en_US.UTF-8


COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]