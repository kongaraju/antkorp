#!/bin/bash
#setup is a bash script which installs the required packages from the apt-repository 
#to setup a 'development' environment for the antkorp platform.

#install boost and then issue a ./b2 install in the boost directory
#XXX: boost_1.54 ; make ; make install;

#install required packages from ubuntu repository 
sudo apt-get -y install dialog
sudo apt-get -y install build-essential
sudo apt-get -y install fakeroot 
sudo apt-get -y install devscripts
sudo apt-get -y install pkg-config
sudo apt-get -y install scons
sudo apt-get -y install lua5.1
sudo apt-get -y install liblua5.1-dev
sudo apt-get -y install libcurl4-openssl-dev
sudo apt-get -y install libhtmlcxx-dev
sudo apt-get -y install attr 
sudo apt-get -y install attr-dev
sudo apt-get -y install luarocks
sudo apt-get -y install libimlib2
sudo apt-get -y install libimlib2-dev
sudo apt-get -y install libjpeg62
sudo apt-get -y install libjpeg62-dev 
sudo apt-get -y install libreoffice-gtk3
sudo apt-get -y install mongodb
sudo apt-get -y install apache2
sudo apt-get -y install reprepo
sudo apt-get -y install libpango1.0-dev
sudo apt-get -y install libgdk-pixbuf2.0-dev
sudo apt-get -y install xorg-dev
sudo apt-get -y install conntrack
sudo apt-get -y install libatk1.0-dev 
sudo apt-get -y install libatk-bridge2.0-dev
sudo apt-get -y install glib-2.0 
sudo apt-get -y install glib-2.0-dev
sudo apt-get -y install libcairo2-dev 
sudo apt-get -y install libgtk-3.0 
sudo apt-get -y install libgtk-3-dev
sudo apt-get -y install npm
sudo apt-get -y install libgd2-xpm
sudo apt-get -y install libgd2-xpm-dev
sudo apt-get -y install flex
sudo apt-get -y install bison
sudo apt-get -y install gawk
sudo apt-get -y install gobject-introspection
sudo apt-get -y install libgirepository1.0-dev
sudo apt-get -y install ruby
sudo apt-get -y install clang


#sudo apt-get -y install 389-ds
#sudo apt-get -y install 389-ds-base
#sudo apt-get -y install 389-admin
#sudo apt-get -y install 389-admin-console

sudo luarocks install lualogging
sudo luarocks install luasocket
sudo luarocks install stdlib
sudo luarocks install luabitop
sudo luarocks install luaposix
sudo luarocks install stdlib
sudo luarocks install lbase64
sudo luarocks install lua-cjson
sudo luarocks install lpeg
sudo luarocks install luaposix
sudo luarocks install lua-imlib2
sudo luarocks install luasec 'OPENSSL_LIBDIR="/usr/lib/x86_64-linux-gnu/"'
