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


### II. How to build MongoDB on linux
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
