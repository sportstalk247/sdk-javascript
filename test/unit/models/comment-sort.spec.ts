import * as chai from 'chai';
import { CommentSortMethod } from '../../../src/models/CommentsModels';

const { expect } = chai;

// Regression: these statics were declared as type annotations with no value, so at
// runtime CommentSortMethod.oldest === undefined and sort queries became `sort=undefined`.
describe('CommentSortMethod', () => {
    it('exposes runtime string values (not undefined)', () => {
        expect(CommentSortMethod.oldest).to.equal('oldest');
        expect(CommentSortMethod.newest).to.equal('newest');
        expect(CommentSortMethod.mostreplies).to.equal('mostreplies');
        expect(CommentSortMethod.votes).to.equal('votes');
    });

    it('exposes votescore and not the old votescroe typo', () => {
        expect((CommentSortMethod as any).votescore).to.equal('votescore');
        expect((CommentSortMethod as any).votescroe).to.be.undefined;
    });

    it('builds reaction sort keys', () => {
        expect(CommentSortMethod.reaction('like')).to.equal('reaction-like');
    });
});
