const catchAsync = require('../../utils/catchAsync');
const {
	restaurantSchema,
	backupSchema,
} = require('../../models/mainModel');
const { uploadBackup } = require('./threads/backupCSV');
const { getFilesInFolder } = require('../document');
const date = new Date();

const padWithZero = (num) => {
	return num < 10 ? '0' + num : num;
};

const replaceSpacesWithDashes = (str) => {
	str = str.replace(/&/g, 'and');
	return str.replace(/\s/g, '-');
};

exports.dailyBackup = catchAsync(async (req, res) => {
	let restaurants = await restaurantSchema.find({});

	const year = date.getFullYear();
	const month = padWithZero(date.getMonth() + 1);
	const day = padWithZero(date.getDate());

	console.log(restaurants.length);

	await performBackup(restaurants, year, month, day);

	let backUpData = await backupSchema.create({
		folder: `${year}-${month}-${day}`,
	});

	res.send({ success: true, data: backUpData });
});

exports.getBackupFiles = catchAsync(async (req, res) => {
	let { folder } = req.body;

	let result = await getFilesInFolder(folder);

	res.send({ success: true, data: result });
});

exports.getALlFolders = catchAsync(async (req, res) => {
	let result = await backupSchema.find({}).sort({ CreatedAt: 1 });

	return res.send({ success: true, data: result });
});

async function performBackup(restaurants, year, month, day) {
	let resultData = [];
	let i = 0;
	while (i < restaurants.length) {
		let data = {
			restaurantName: replaceSpacesWithDashes(restaurants[i].name),
			restaurantId: restaurants[i].id,
			year,
			month,
			day,
		};

		let result = await uploadBackup(data);
		resultData.push(result);

		i++;
	}

	return resultData;
}
