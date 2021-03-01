const expect = require('chai').expect;
const server = require('../../server');
const request = require('supertest')(server);

describe('User Management', () => {
    let user1;
    
    beforeEach((done) => {
        user1 = require("../fixtures/user1.json");

        // Register the user
        request
        .post('/api/users/register')
        .set('Accept', 'application/json')
        .send(user1)
        .end((err, response) => {
            if (err) done(err);
            expect(response.body.success).to.be.true;
            expect(response.statusCode).to.equal(200);

            // Authenticate the user
            request
            .post('/api/users/authenticate')
            .set('Accept', 'application/json')
            .send({username: user1.username, password: user1.password})
            .end((err, response) => {
                if (err) done(err);
                expect(response.body.success).to.be.true;
                expect(response.body.user.username).to.equal(user1.username);
                expect(response.statusCode).to.equal(200);
                user1._id = response.body.user._id;
                user1.auth_token = response.body.token;
                done();
            });
        });
    })

    afterEach((done) => {
        request
        .delete('/api/users')
        .set('Accept', 'application/json')
        .query({ userId: user1._id })
        .set('Authorization', user1.auth_token)
        .send()
        .end((err, response) => {
            if (err) done(err);
            done();
        });
    })

    it('Get user1 profile', (done) => {
        request
        .get('/api/users/profile')
        .set('Accept', 'application/json')
        .set('Authorization', user1.auth_token)
        .end((err, response) => {
            if (err) done(err);
            expect(response.body.success).to.be.true;
            expect(response.body.user._id).to.equal(user1._id);
            done();
        });
    });

    it('Get user1 profile after deletion', (done) => {

        // Delete the user first
        request
        .delete('/api/users')
        .set('Accept', 'application/json')
        .query({ userId: user1._id })
        .set('Authorization', user1.auth_token)
        .send()
        .end((err, response) => {
            if (err) done(err);
            expect(response.body.success).to.be.true;
            expect(response.statusCode).to.equal(200);

            // Request for user profile
            request
            .get('/api/users/profile')
            .set('Accept', 'application/json')
            .set('Authorization', user1.auth_token)
            .end((err, response) => {
                if (err) done(err);
                expect(response.status).to.equal(401);
                done();
            });
        });
    });

    describe('Channel Management', () => {
        let channel;
        
        beforeEach((done) => {
            channel = require("../fixtures/channel.json");
            channel.creator = user1._id;
    
            // Create Channel
            request
            .post('/api/channels')
            .set('Accept', 'application/json')
            .set('Authorization', user1.auth_token)
            .send(channel)
            .end((err, response) => {
                if (err) done(err);
                expect(response.body.success).to.be.true;
                expect(response.statusCode).to.equal(200);
                channel._id = response.body.channel._id;
                done();
            });
        })
    
        afterEach((done) => {

            // Delete channel
            request
            .delete('/api/channels')
            .set('Accept', 'application/json')
            .query({ channelId: channel._id, creatorId: user1._id })
            .set('Authorization', user1.auth_token)
            .send()
            .end((err, response) => {
                if (err) done(err);
                done();
            });
        })
    
        it('Get channel information', (done) => {
            request
            .get('/api/channels/channel')
            .set('Accept', 'application/json')
            .set('Authorization', user1.auth_token)
            .query({ channelId: channel._id })
            .end((err, response) => {
                if (err) done(err);
                expect(response.body.success).to.be.true;
                expect(response.body.channel.name).to.equal(channel.name);
                expect(response.body.members[0]._id).to.equal(user1._id);
                done();
            });
        });
    
        it('Get channel information after deletion', (done) => {
    
            // Delete the channel first
            request
            .delete('/api/channels')
            .set('Accept', 'application/json')
            .query({ channelId: channel._id, creatorId: user1._id })
            .set('Authorization', user1.auth_token)
            .send()
            .end((err, response) => {
                if (err) done(err);
                expect(response.body.success).to.be.true;
                expect(response.statusCode).to.equal(200);
    
                // Request for channel info
                request
                .get('/api/channels/channel')
                .set('Accept', 'application/json')
                .set('Authorization', user1.auth_token)
                .query({ channelId: channel._id })
                .end((err, response) => {
                    if (err) done(err);
                    expect(response.body.success).to.be.false;
                    done();
                });
            });
        });
    });
});