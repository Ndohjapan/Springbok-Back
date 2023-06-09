const { parentPort } = require('worker_threads');
const { transactionSchema, tempoararyTransactionsSchema } = require('../../../models/mainModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AppError = require('../../../utils/appError');

const { uploadFile } = require('../../document');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

dotenv.config({ path: '../../../config/config.env' });
const MONGO_URI = process.env.mongoDbUrl;

async function connectDB() {
	try {
		const conn = await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		return conn;
	} catch (err) {
		let req = { originalUrl: 'connectDB' };
		// errorPrint(err, req);
	}
}

async function exportCSV(from, to, restaurantId, userId) {
	[from, to] = dateFormat(from, to);
	try {
		let name = Date.now() + '.csv';
		const csvWriter = createCsvWriter({
			path: name,
			header: [
				{ id: 'id', title: 'id' },
				{ id: 'from', title: 'From' },
				{ id: 'to', title: 'To' },
				{ id: 'amount', title: 'Amount' },
				{ id: 'restaurantPreviousBalance', title: 'Resta. Prev. Balance' },
				{ id: 'restaurantCurrentBalance', title: 'Resta. Curr. Balance' },
				{ id: 'studentPreviousBalance', title: 'Std. Prev. Balance' },
				{ id: 'studentCurrentBalance', title: 'Std. Curr. Balance' },
				{ id: 'createdAt', title: 'Time' },
			],
		});
		// file name

		let transactions = [];
		if (restaurantId) {
			transactions = await transactionSchema
				.find({ createdAt: { $gte: from, $lte: to }, to: restaurantId }, null, {
					sort: { createdAt: -1 },
				})
				.populate(['from', 'to']);
		} 
    
		else if(userId){
			transactions = await transactionSchema
				.find({ createdAt: { $gte: from, $lte: to }, from: userId }, null, {
					sort: { createdAt: -1 },
				})
				.populate(['from', 'to']);
		}
    
		else {
			transactions = await transactionSchema
				.find({ createdAt: { $gte: from, $lte: to } }, null, {
					sort: { createdAt: -1 },
				})
				.populate(['from', 'to']);
		}

		let datas = [];
		if (!transactions.length) {
			console.log('No transactions');
			return {
				status: 400,
				body: { success: false, message: 'There are no transactions' },
			};
		}
		for (i = 0; i < transactions.length; i++) {
			let objectData = {};

			objectData.id = transactions[i]._id;
			objectData.from =
        transactions[i].from.firstname + ' ' + transactions[i].from.lastname;
			objectData.to = transactions[i].to.name;
			objectData.amount = transactions[i].amount;
			objectData.restaurantPreviousBalance =
        transactions[i].restaurantPreviousBalance;
			objectData.restaurantCurrentBalance =
        transactions[i].restaurantCurrentBalance;
			objectData.studentPreviousBalance =
        transactions[i].studentPreviousBalance;
			objectData.studentCurrentBalance = transactions[i].studentCurrentBalance;
			objectData.createdAt = transactions[i].createdAt;

			datas.push(objectData);
		}

		await csvWriter.writeRecords(datas);
		console.log('The CSV file was written successfully');

		return new Promise((resolve, reject) => {
			uploadFile(name).then((result) => {
				resolve(result);
				deleteCSV(name);
			});
		});
	} catch (err) {
		console.log(err);
		return { status: 400, body: { success: false, message: err.message } };
	}
}

async function deleteCSV(name) {
	const uniqueFileName = path.join(__dirname, '..', '..', '..', name);
	const url = uniqueFileName;
	fs.access(url, fs.F_OK, async (err, ac) => {
		if (err) {
			return err;
		} else {
			await fs.unlink(url, (err, fc) => {
				if (err) {
					return 'Error Occure On File Deletion!';
				} else {
					console.log('File deleted!');
					return 'File deleted!';
				}
			});
		}
	});
}

async function exportTemporaryTransations(restaurantId, userId){
	try {
		let name = Date.now() + '.csv';
		const csvWriter = createCsvWriter({
			path: name,
			header: [
				{ id: 'id', title: 'id' },
				{ id: 'from', title: 'From' },
				{ id: 'to', title: 'To' },
				{ id: 'amount', title: 'Amount' },
				{ id: 'disabled', title: 'Disabled' },
				{ id: 'createdAt', title: 'Time' },
			],
		});
		// file name

		let transactions = [];
		if (restaurantId) {
			transactions = await tempoararyTransactionsSchema
				.find({ to: restaurantId }, null, {
					sort: { createdAt: -1 },
				})
				.populate(['from', 'to']);
		} 
    
		else if(userId){
			transactions = await tempoararyTransactionsSchema
				.find({ from: userId }, null, {
					sort: { createdAt: -1 },
				})
				.populate(['from', 'to']);
		}
    

		let datas = [];
		if (!transactions.length) {
			console.log('No transactions');
			return {
				status: 400,
				body: { success: false, message: 'There are no transactions' },
			};
		}
		for (i = 0; i < transactions.length; i++) {
			let objectData = {};

			objectData.id = transactions[i]._id;
			objectData.from =
        transactions[i].from.firstname + ' ' + transactions[i].from.lastname;
			objectData.to = transactions[i].to.name;
			objectData.amount = transactions[i].amount;
			objectData.disabled = transactions[i].disabled;
			objectData.createdAt = transactions[i].createdAt;

			datas.push(objectData);
		}

		await csvWriter.writeRecords(datas);
		console.log('The CSV file was written successfully');

		return new Promise((resolve, reject) => {
			uploadFile(name).then((result) => {
				resolve(result);
				deleteCSV(name);
			});
		});
	} catch (err) {
		console.log(err);
		return { status: 400, body: { success: false, message: err.message } };
	}
}

parentPort.on('message', async (data) => {
	let conn = await connectDB();
	if(data.type === 'normal'){
		let response = await exportCSV(data.from, data.to, data.restaurantId, data.userId);
		parentPort.postMessage(response);
		conn.disconnect();
	}
	else{
		let response = await exportTemporaryTransations(data.restaurantId, data.userId);
		parentPort.postMessage(response);
		conn.disconnect();
	}
});

function dateFormat(from, to) {
	from = new Date(from);
	from.setHours(1);
	from.setMinutes(0);
	from.setSeconds(0);

	to = new Date(to);
	to.setHours(24);
	to.setMinutes(59);
	to.setSeconds(59);

	return [from, to];
}