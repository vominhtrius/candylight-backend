# candylight-backend

## I. How to build Sever swagger 
### 1. Install the swagger module
> $ npm install -g swagger

### 2. Create a new swagger project
> $ swagger project create server

### 3. Cd to project server
> $ cd server/

### 4. Start server swagger
> $ swagger project start

### 5. Design your API in the Swagger Editor
> $ swagger project edit

### Link tham khảo:

[swagger](https://www.npmjs.com/package/swagger)


### II. How to build MongoDB on ubuntu
#### 1. Install MongoDB Community Edition 

- Link tham khảo:

[Install MongoDB Community Edition on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

#### 2. Start server MongoDB

- Define port server: `27017`

> sudo service mongod start

#### 3. Shutdown MongoDB

> sudo service mongod stop

#### 4. Restart MongoDB

> sudo service mongod restart

#### 5. Uninstall MongoDB Community Edition
##### 5.1 Stop MongoDB.  

> sudo service mongod stop

##### 5.2 Remove Packages

> sudo apt-get purge mongodb-org*

##### 5.3 Remove Data Directories

> sudo rm -r /var/log/mongodb
> sudo rm -r /var/lib/mongodb

##### 5.2 Install MongoDB use npm

> npm install mongodb --save

- Link tham khảo:

[mongodb](https://www.npmjs.com/package/mongodb)

### III. How to build Redis server on ubuntu
#### 1. Redis Quick Start

- Link tham khảo:

[Redis Quick Start](https://redis.io/topics/quickstart)

[How To Install and Secure Redis on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04)

#### 2. Install Redis use npm

> npm install redis

- Link tham khảo:

[redis - a node.js redis client](https://www.npmjs.com/package/redis)
