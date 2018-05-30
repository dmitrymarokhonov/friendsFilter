import renderFriends from './templates/friend.hbs';
import './style/friends.css';
import * as helpers from './helpers/helpers';

VK.init({
    apiId: 6487443
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизироваться'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.77';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    })
}

(async () => {
    try {
        await auth();
        const [me] = await callAPI('users.get', { name_case: 'gen' });
        const headerInfo = document.querySelector('#headerinfo');

        headerInfo.textContent = `Друзья на странице ${me.first_name} ${me.last_name}`;
        const friends = await callAPI('friends.get', { fields: 'city, country, photo_100' });
        console.log(friends);
        const template = document.querySelector('#user-template').textContent;
        const render = Handlebars.compile(template);
        const html = render(friends);
        const reesults = document.querySelector('#results');

        results.innerHTML = html;

    } catch (e) {
        console.error(e);
    }
})();

let vkData = {
    count: 5,
    friends: [
        { name: 'Дмитрий', lastName: 'Марохонов', age: 35 },
        { name: 'Ilona', lastName: 'Heino', age: 2 },
        { name: 'Annika', lastName: 'Heino', age: 33 },
        { name: 'Евгений', lastName: 'Иленда', age: 39 },
        { name: 'Игорь', lastName: 'Яицкий', age: 25 }
    ],
    items: []
}

container.innerHTML = renderFriends(vkData);

const div = document.createElement('div');

div.innerHTML = renderFriends({ test: [1, 2, 3, 4, 5] });
container.appendChild(div);