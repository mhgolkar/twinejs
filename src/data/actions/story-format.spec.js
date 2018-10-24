const { spy } = require('sinon');
const actions = require('./story-format');

describe('story format actions module', () => {
	const fakeId = 'not-a-real-id';
	const props = { fake: true };	
	let store;

	beforeEach(() => {
		store = { dispatch: spy() };
	});

	test('dispatches a CREATE_FORMAT mutation with createFormat()', () => {
		actions.createFormat(store, props);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('CREATE_FORMAT', props)).toBe(true);
	});

	test('dispatches an UPDATE_FORMAT mutation with createFormat()', () => {
		actions.updateFormat(store, fakeId, props);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('UPDATE_FORMAT', fakeId, props)).toBe(true);
	});

	test('dispatches a DELETE_FORMAT mutation with deleteFormat()', () => {
		actions.deleteFormat(store, fakeId);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('DELETE_FORMAT', fakeId)).toBe(true);
	});

	test('creates built-in formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'Default Format',
						version: '1.0.0'
					},
					proofingFormat: {
						name: 'Proofing Format',
						version: '1.0.0'
					}
				},
				storyFormat: {
					formats: []
				}
			}
		};

		actions.repairFormats(formatsStore);

		let created = {};

		for (let i = 0; i < formatsStore.dispatch.callCount; i++) {
			let call = formatsStore.dispatch.getCall(i);

			if (call.args[0] === 'CREATE_FORMAT') {
				created[call.args[1].name + '-' + call.args[1].version] = call.args[1];
			}
		}

		expect(created['Harlowe-1.2.4']).toBeDefined();
		expect(created['Harlowe-1.2.4'].url).toBe('story-formats/harlowe-1.2.4/format.js');
		expect(created['Harlowe-1.2.4'].userAdded).toBe(false);
		expect(created['Harlowe-2.1.0']).toBeDefined();
		expect(created['Harlowe-2.1.0'].url).toBe('story-formats/harlowe-2.1.0/format.js');
		expect(created['Harlowe-2.1.0'].userAdded).toBe(false);
		expect(created['Paperthin-1.0.0']).toBeDefined();
		expect(created['Paperthin-1.0.0'].url).toBe('story-formats/paperthin-1.0.0/format.js');
		expect(created['Paperthin-1.0.0'].userAdded).toBe(false);
		expect(created['Snowman-1.3.0']).toBeDefined();
		expect(created['Snowman-1.3.0'].url).toBe('story-formats/snowman-1.3.0/format.js');
		expect(created['Snowman-1.3.0'].userAdded).toBe(false);
		expect(created['SugarCube-1.0.35']).toBeDefined();
		expect(created['SugarCube-1.0.35'].url).toBe('story-formats/sugarcube-1.0.35/format.js');
		expect(created['SugarCube-1.0.35'].userAdded).toBe(false);
		expect(created['SugarCube-2.21.0']).toBeDefined();
		expect(created['SugarCube-2.21.0'].url).toBe('story-formats/sugarcube-2.21.0/format.js');
		expect(created['SugarCube-2.21.0'].userAdded).toBe(false);
	});

	test('sets default formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy().withArgs('UPDATE_PREF'),
			state: {
				pref: {},
				storyFormat: {
					formats: []
				}
			}
		};

		actions.repairFormats(formatsStore);

		expect(formatsStore.dispatch.calledWith(
			'UPDATE_PREF', 'defaultFormat', { name: 'Harlowe', version: '2.1.0' }
		)).toBe(true);
		expect(formatsStore.dispatch.calledWith(
			'UPDATE_PREF', 'proofingFormat', { name: 'Paperthin', version: '1.0.0' }
		)).toBe(true);
	});

	test('deletes unversioned formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ id: fakeId, name: 'Test' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.calledWith('DELETE_FORMAT', fakeId)).toBe(true);
	});

	test('does not duplicate formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy().withArgs('CREATE_FORMAT'),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ name: 'Harlowe', version: '1.2.4' },
						{ name: 'Harlowe', version: '2.0.1' },
						{ name: 'Paperthin', version: '1.0.0' },
						{ name: 'Snowman', version: '1.3.0' },
						{ name: 'SugarCube', version: '1.0.35' },
						{ name: 'SugarCube', version: '2.21.0' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.calledOnce).toBe(false);
	});

	test('deletes outdated story format versions with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ name: 'Custom', version: '1.2.3' },
						{ id: fakeId, name: 'Custom', version: '1.2.1' },
						{ name: 'Custom', version: '2.0.0' }
					]
				}
			}
		};

		formatsStore.dispatch.withArgs('DELETE_FORMAT', fakeId);
		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.withArgs('DELETE_FORMAT', fakeId).calledOnce).toBe(true);
	});

	test('updates the default format version with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'Default Format',
						version: '1.0.0'
					},
					proofingFormat: {
						name: 'Proofing Format',
						version: '1.0.0'
					}
				},
				storyFormat: {
					formats: [
						{ id: fakeId, name: 'Default Format', version: '1.0.1' },
						{ id: fakeId, name: 'Default Format', version: '2.0.1' },
						{ id: fakeId, name: 'Proofing Format', version: '1.0.0' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.calledWith(
			'UPDATE_PREF',
			'defaultFormat',
			{ name: 'Default Format', version: '1.0.1' }
		)).toBe(true);
	});

	test('updates the proofing version with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'Default Format',
						version: '1.0.0'
					},
					proofingFormat: {
						name: 'Proofing Format',
						version: '1.0.0'
					}
				},
				storyFormat: {
					formats: [
						{ id: fakeId, name: 'Default Format', version: '1.0.0' },
						{ id: fakeId, name: 'Proofing Format', version: '1.0.0' },
						{ id: fakeId, name: 'Proofing Format', version: '1.0.1' },
						{ id: fakeId, name: 'Proofing Format', version: '2.0.1' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.calledWith(
			'UPDATE_PREF',
			'proofingFormat',
			{ name: 'Proofing Format', version: '1.0.1' }
		)).toBe(true);
	});
});