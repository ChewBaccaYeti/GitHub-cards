import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const token = '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';
const port = 4000;
const url = 'https://api.github.com/users';
const cache = {};

const app = express();

app.use(cors()).get('/', async (req, res) => {
    try {
        if (cache[url]) {
            console.log('Using cached data...');
            return res.json({
                message: 'success',
                status: 200,
                data: {
                    users: cache[url]
                }
            });
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user data from GitHub API');
        }

        const users = await response.json();
        cache[url] = users;
        res.json({
            message: 'success',
            status: 200,
            data: {
                users: users
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
}).listen(port, () => {
    console.log(`Server started on port ${port}`);
});
