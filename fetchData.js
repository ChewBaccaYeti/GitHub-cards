const serverUrl = 'http://localhost:4000';

async function fetchDataFromServer() {
    try {
        const response = await fetch(serverUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch user data from server');
        }
        const data = await response.json();
        renderUsers(data.data.users);
    } catch (error) {
        console.error(error);
    }
}

async function fetchLength(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data from GitHub API');
        }
        const data = await response.json();
        return data.length;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function renderUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    for (const user of users) {
        const listItem = document.createElement('li');
        listItem.classList.add('user-card');

        const userDiv = document.createElement('div');
        userDiv.classList.add('user-info');

        const avatarImg = document.createElement('img');
        avatarImg.src = user.avatar_url;
        avatarImg.alt = `${user.login}'s avatar`;
        avatarImg.classList.add('avatar');
        userDiv.appendChild(avatarImg);

        try {
            const quote = await getRandomQuote();
            const quoteParagraph = document.createElement('p');
            quoteParagraph.textContent = quote;
            userDiv.appendChild(quoteParagraph);
        } catch (error) {
            console.error('Failed to fetch random quote:', error);
        }

        const profileLink = document.createElement('a');
        profileLink.href = user.html_url;
        profileLink.textContent = user.login;
        profileLink.classList.add('profile-link');
        userDiv.appendChild(profileLink);

        const repoUrl = `${user.repos_url}?per_page=100`;
        const languages = await getLanguagesFromRepos(repoUrl);
        const totalRepos = Object.values(languages).reduce((acc, curr) => acc + curr, 0);
        const languagesList = document.createElement('ul');
        languagesList.classList.add('languages-list');

        for (const language in languages) {
            const percentage = ((languages[language] / totalRepos) * 100).toFixed(2);
            const languageItem = document.createElement('li');
            languageItem.classList.add('language');
            languageItem.textContent = `${language}: ${percentage}% (${languages[language]} repos)`;
            languagesList.appendChild(languageItem);
        }
        userDiv.appendChild(languagesList);

        const links = [
            { name: 'Followers', url: `${user.followers_url}?per_page=100` },
            { name: 'Followings', url: `${user.following_url}?per_page=100` },
            { name: 'Stars', url: `${user.starred_url}?per_page=100` },
            { name: 'Subscriptions', url: `${user.subscriptions_url}?per_page=100` },
            { name: 'Organizations', url: `${user.organizations_url}?per_page=100` },
            { name: 'Repositories', url: repoUrl },
        ];

        for (const link of links) {
            const count = await fetchLength(link.url);
            const linkElement = document.createElement('p');
            linkElement.href = link.url;
            linkElement.textContent = `${link.name}: ${count}`;
            linkElement.classList.add('user-stats');
            userDiv.appendChild(linkElement);
        }
        listItem.appendChild(userDiv);
        userList.appendChild(listItem);
    }
}

const categories = ['alone', 'courage', 'dad', 'death', 'happiness', 'experience', 'failure', 'faith', 'family', 'freedom', 'friendship', 'home', 'knowledge', 'mom'];

function getRandomCategory() {
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
}

async function getRandomQuote() {
    try {
        const category = getRandomCategory();
        const response = await fetch(`https://api.api-ninjas.com/v1/quotes?category=${category}`, {
            headers: {
                'X-Api-Key': 'BDHR+5rmegqGXEer5MPkmg==J0UeTS3UxzrUwH7C'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch quote. Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].quote;
        } else {
            throw new Error('No quotes found.');
        }

    } catch (error) {
        console.error('Failed to fetch random quote:', error);
        throw error;
    }
}

async function getLanguagesFromRepos(repoUrl) {
    try {
        const response = await fetch(repoUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch repository data from GitHub API');
        }

        const repositories = await response.json();
        const languages = {};
        repositories.forEach(repo => {
            const language = repo.language;
            if (language) {
                if (languages[language]) {
                    languages[language]++;
                } else {
                    languages[language] = 1;
                }
            }
        });
        return languages;

    } catch (error) {
        console.error('Error fetching repository data:', error);
        return {};
    }
}

window.onload = fetchDataFromServer;