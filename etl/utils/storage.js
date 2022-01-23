pg = require('pg')
var knex = require('knex');
const { attachPaginate } = require('knex-paginate');

attachPaginate();

function Storage(connectInfos) {
  connectInfos.max = 3;
  this.pool = new pg.Pool(connectInfos)
  this.knex = knex({
    client: 'pg',
    connection: connectInfos
  });
  // console.log('init writer')
}

Storage.prototype.client = async function () {
  const client = await this.pool.connect();
  return client;
}

Storage.prototype.insert = async function (type, obj) {
  //  console.log('insert', type, obj);
  var query = this.knex(type).insert(obj).toString()
   console.log(query)
  await this.executeAsync(query)
 
}

Storage.prototype.update = async function (type, field, value, obj) {
  //  console.log('insert', type, obj);
  var c = await this.client()
  var query = this.knex(type).where(field, value).update(obj).toString()
  console.log(query)
  c.query(query, (err, res) => {
    if (err) {
      console.log(err)
    }
    // console.log(err, res)
    c.release()
  })
}

Storage.prototype.updateMulti = async function (type, conditions, obj) {
  //  console.log('insert', type, obj);
  var c = await this.client()
  var query = this.knex(type).where(conditions).update(obj).toString()
  console.log(query)
  c.query(query, (err, res) => {
    if (err) {
      console.log(err)
    }
    // console.log(err, res)
    c.release()
  })
}

Storage.prototype.getMax = async function (type, field) {
  var c = await this.client()
  var query = this.knex.max(field).from(type).toString()
  //  console.log(query)
  var res = await c.query(query)
  c.release();
  if (res != null && res.rows[0] != null && res.rows[0].max != null) {
    return (parseInt(res.rows[0].max));
  }
  else {
    return (0);
  }
}

Storage.prototype.getMaxWhere = async function (type, field, where) {
  var c = await this.client()
  var query = this.knex.max(field).where(where).from(type).toString()
  //  console.log(query)
  var res = await c.query(query)
  c.release();
  if (res != null && res.rows[0] != null && res.rows[0].max != null) {
    return (parseInt(res.rows[0].max));
  }
  else {
    return (0);
  }
}

Storage.prototype.getMin = async function (type, field) {
  var c = await this.client()
  var query = this.knex.min(field).from(type).toString()
  //  console.log(query)
  var res = await c.query(query)
  c.release();
  if (res != null && res.rows[0] != null) {
    return (parseInt(res.rows[0].min));
  }
  else {
    return (null);
  }
}

Storage.prototype.get = async function (type, field, value) {
  var c = await this.client()
  var query = this.knex.where(field, value).from(type).toString()
  //console.log(query)
  var res = await c.query(query)
  c.release();
  if (res.rows != null && res.rows[0] != null) {
    return res.rows[0]
  }
  return null;
}

Storage.prototype.getMulti = async function (type, conditions) {
  var c = await this.client()
  var query = this.knex.where(conditions).from(type).toString()
  //console.log(query)
  var res = await c.query(query)
  c.release();
  if (res.rows != null && res.rows[0] != null) {
    return res.rows[0]
  }
  return null;
}

Storage.prototype.listMulti = async function (type, conditions) {
  var c = await this.client()
  var query = this.knex.where(conditions).from(type).toString()
  //console.log(query)
  var res = await c.query(query)
  c.release();
  if (res.rows != null && res.rows[0] != null) {
    return res.rows
  }
  return null;
}


Storage.prototype.executeAsync = async function (query) {
  try {
    var c = await this.client();
    var res = await c.query(query)
    c.release();
    return (res.rows);
  } catch (error) {
    console.log(error)
    c.release();
  }
}

module.exports = Storage;
