FROM ubuntu:24.04 as base
ARG UID=1001
ARG GID=1001
ARG BUN_INSTALL=/usr/local
ARG DEBIAN_FRONTEND="noninteractive"
ARG TZ="GMT"

ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

COPY scripts/ /rnadetector/scripts/

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apt update --fix-missing \
    && apt install -y perl locales dialog wget gnupg gosu curl ca-certificates zip unzip git libcap2-bin \
                      libpng-dev software-properties-common dirmngr nano htop \
    && locale-gen "${LC_ALL}" \
    && mkdir -p ~/.gnupg \
    && chmod 600 ~/.gnupg \
    && echo "disable-ipv6" >> ~/.gnupg/dirmngr.conf \
    && echo "keyserver hkp://keyserver.ubuntu.com:80" >> ~/.gnupg/dirmngr.conf \
    && curl -fsSL https://deb.nodesource.com/setup_21.x | bash - \
    && apt-get install -y nodejs \
    && curl -fsSL https://bun.sh/install | bash \
    && apt-get -yqq autoclean \
    && apt-get -yqq autoremove --purge \
    && apt-get -yqq purge $(dpkg --get-selections | grep deinstall | sed s/deinstall//g) \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/cache/* /var/tmp/* \
    && if ! getent group $GID > /dev/null 2>&1; then groupadd -g $GID rnadetector; fi \
    && useradd -m -s /bin/bash -u $UID -g $GID rnadetector \
    && mkdir -p /rnadetector/app \
    && chown -R $UID:$GID /rnadetector/app \
    && mkdir -p /rnadetector/miniforge \
    && mkdir -p /rnadetector/scripts \
    && chown -R $UID:$GID /rnadetector/miniforge \
    && chown -R $UID:$GID /rnadetector/scripts \
    && cat /home/rnadetector/.bashrc /rnadetector/scripts/conda-init.patch > /home/rnadetector/.bashrc \
    && rm /rnadetector/scripts/conda-init.patch \
    && chmod +x /rnadetector/scripts/*

USER rnadetector
WORKDIR /rnadetector/app
VOLUME /rnadetector/app
VOLUME /rnadetector/miniforge
EXPOSE 3000

CMD ["sleep", "infinity"]
