import './style/friends.css';
import renderFriends from './templates/VK_friendsList.hbs';
import renderNewFriends from './templates/filtered_friendsList.hbs';
import './style/friends.css';
import { isMatching } from './helpers/helpers';
import { compareNames } from './helpers/helpers';

const friendsList = document.querySelector('#friendList');
const filteredList = document.querySelector('#filteredList');
let friendsArray = localStorage.getItem('friendsArray') ? JSON.parse(localStorage.getItem('friendsArray')) : [];
let newFriendsArray = localStorage.getItem('newFriendsArray') ? JSON.parse(localStorage.getItem('newFriendsArray')) : [];
const filterFilteredList = document.querySelector('#filterFilteredList');
const filterFullList = document.querySelector('#filterFullList');
const saveButton = document.querySelector('#saveButton');
let createFriendslist = (friends) => renderFriends({ items: friends });
let createNewFriendslist = (friends) => renderNewFriends({ items: friends });

makeDnD([friendsList, filteredList]);

function makeDnD(zones) {
    let currentDrag;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', e => {
            currentDrag = { source: zone, node: e.target }
        });

        zone.addEventListener('dragover', e => {
            e.preventDefault();
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();

            if (currentDrag) {
                if (currentDrag.source !== zone) {
                    const sourceUl = currentDrag.source.id;
                    const DraggableFriendId = currentDrag.node.dataset.id;
                    const li = e.target.closest('.friends__item');
                    const FAitem = friendsArray.find(f => f.id === Number(DraggableFriendId));
                    const NFAitem = newFriendsArray.find(f => f.id === Number(DraggableFriendId));

                    if (sourceUl === 'friendList') {
                        newFriendsArray.push(FAitem);
                        friendsArray = friendsArray.filter(f => f.id !== Number(DraggableFriendId));
                    }
                    if (sourceUl === 'filteredList') {
                        friendsArray.push(NFAitem);
                        newFriendsArray = newFriendsArray.filter(f => f.id !== Number(DraggableFriendId));
                    }

                    zone.insertBefore(currentDrag.node, li);
                    sortFriendsArrays();

                    setTimeout(() => {
                        populateFriendsList();
                        populateNewFriendsList();
                    }, 1500);

                    console.log(currentDrag.source.id);
                    console.log(currentDrag.node.dataset.id);

                }

                currentDrag = null;
            }

        });
    })
}

filterFullList.addEventListener('keyup', e => {
    populateFriendsList(e.target.value);
});

filterFilteredList.addEventListener('keyup', e => {
    populateNewFriendsList(e.target.value);
});

friendsList.addEventListener('click', e => {
    if (!e.target.classList.contains('plus-icon')) return;
    const li = e.target.closest('.friends__item');
    const id = li.getAttribute('data-id');
    const item = friendsArray.find(f => f.id === Number(id));

    newFriendsArray.push(item);
    friendsArray = friendsArray.filter(f => f.id !== Number(id));
    sortFriendsArrays();
    populateFriendsList();
    populateNewFriendsList();
});

filteredList.addEventListener('click', e => {
    if (!e.target.classList.contains('close-icon')) return;
    const li = e.target.closest('.friends__item');
    const id = li.getAttribute('data-id');
    const item = newFriendsArray.find(f => f.id === Number(id));

    friendsArray.push(item);
    newFriendsArray = newFriendsArray.filter(f => f.id !== Number(id));
    sortFriendsArrays();
    populateFriendsList();
    populateNewFriendsList();

});

saveButton.addEventListener('click', e => {
    localStorage.setItem('friendsArray', JSON.stringify(friendsArray));
    localStorage.setItem('newFriendsArray', JSON.stringify(newFriendsArray));
    alert('Списки друзей сохранены в Local Storage');
});

function populateFriendsList(filter = '') {

    friendsList.innerHTML = '';

    let filteredFriendsArray = friendsArray.filter(f => {
        let fullname = `${f.first_name} ${f.last_name}`;
        return isMatching(fullname, filter);
    });

    friendsList.innerHTML = createFriendslist(filteredFriendsArray);
}

function populateNewFriendsList(filter = '') {
    filteredList.innerHTML = '';
    let filteredNewFriendsArray = newFriendsArray.filter(f => {
        let fullname = `${f.first_name} ${f.last_name}`;
        return isMatching(fullname, filter);
    });

    filteredList.innerHTML = createNewFriendslist(filteredNewFriendsArray);
}

function sortFriendsArrays() {
    friendsArray.sort(compareNames);
    newFriendsArray.sort(compareNames);
}


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
        let friends = await callAPI('friends.get', { fields: 'photo_100' });
        if (friendsArray.length === 0) {
            friendsArray = friends.items.sort(compareNames);
            friendsArray = friendsArray.filter(f => !f.hasOwnProperty('deactivated'));
        }
        if (newFriendsArray.length > 0) {
            populateNewFriendsList();
        }

        populateFriendsList();

    } catch (e) {
        console.error(e);
    }
})();
