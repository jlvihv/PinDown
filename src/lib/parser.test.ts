import { expect, test } from 'bun:test';
import downloadPinterest from './parser';

test('parser', () => {
	downloadPinterest('kolosmaria12');
});
