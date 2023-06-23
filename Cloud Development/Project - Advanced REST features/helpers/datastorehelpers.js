//importing node modules 
const {Datastore} =  require('@google-cloud/datastore');
//globals 
const projectId = 'assignment5-arf';
const datastore = new Datastore({
    projectId: projectId,
    keyFilename: 'keyfile.json'
  });
//helper functions 
//tested
// 1. create a boat // 5. create a load 
async function addEntity(kind, data, url) {
    var entity = {
      key: datastore.key(kind),
      data: data,
    };
    const result = await datastore.insert(entity);
    const id = result[0].mutationResults[0].key.path[0].id;
    const key = datastore.key([kind, parseInt(id, 10)]);
    entity.data.self = `${entity.data.self}`+ id;
    await datastore.update(entity);
    var insertedEntity = await datastore.get(key);
    insertedEntity[0]['id'] = id;
    return insertedEntity;
  }
//tested
// 2. view a boat 6. view a load 
async function viewEntity(kind, id) {
    //key finction need to be an int 
    const key = datastore.key([kind, parseInt(id, 10)]);
    const [result] = await datastore.get(key);
    return result;
  }
//tested 
// 3. view all boats 7. view all loads   

async function viewAllEntities(kind){
  //this is how to get all entities by a kind  
  //without pagination 
  //const key = datastore.createQuery(kind)
  const key = datastore.createQuery(kind);
  const [result] = await datastore.runQuery(key);

  return  result;
}
//
// 4. delete a boat 8. delete a load 
async function deleteEntity(kind, id){
    const key = datastore.key([kind, parseInt(id, 10)]);
    const results = await datastore.delete(key);
    return results; 
}
//9. manage a load // manage a boat 
async function setEntity(kind, id, data){
    const key = datastore.key([kind, parseInt(id, 10)]);
    const entity = {
        key: key,
        data: data
    };
    const results = await datastore.update(entity);
    return results;
}
//10. view all loads for a given boat


module.exports = {
    addEntity,
    viewEntity,
    viewAllEntities,
    deleteEntity,
    setEntity
}
