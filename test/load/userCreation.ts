
import * as dotenv from 'dotenv';
import {UserClient} from "../../src";
import {User} from "../../src/models/CommonModels";

dotenv.config();

const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};

console.log(config);

const client = UserClient.init(config);

// @ts-ignore
const userCreationLimit = process.env.USER_CREATION_LIMIT || 1000;
let counter = 0;

async function loadTest() {
    const users: User[] = [];
    const userCreationPromises:Promise<User | void>[] = [];
    for(var i=0; i < userCreationLimit; i++) {
        const userid = Math.random().toString().substr(2, 12);
        const User = {
            userid,
            handle: userid,
            displayname: userid
        }
        users.push(User);
    }
    for(var j=0; j<userCreationLimit; j++) {
        console.log('creating user', users[j]);
        userCreationPromises.push(client.createOrUpdateUser(users[j]).then(u=>{
            console.log(u);
        }).catch(e=>{
            console.log(e);
        }));
    }
    return Promise.all(userCreationPromises);
}
describe('loadtest', ()=> {
    it('loads users', ()=>{
        return loadTest();
    })
})

