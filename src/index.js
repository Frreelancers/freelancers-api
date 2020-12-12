import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

const axios = require('axios')

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.post('/razorpay', (req, res) => {
		const project = req.body.project;
		const freelancer = req.body.freelancer
		
		
		axios.post("https://api.razorpay.com/v1/payouts", {
			"account_number": "2323230061328942",
			"amount": Number(project.amount) * 100,
			"currency": "INR",
			"mode": "UPI",
			"purpose": "payout",
			"fund_account": {
				"account_type": "vpa",
				"vpa": {
					"address": freelancer.upiId
				},
				"contact": {
					"name": freelancer.name,
					"email": freelancer.email,
					"contact": freelancer.phoneNumber,
					"type": "self",
					"reference_id": "Acme Contact ID 12345",
					"notes": {
						"notes_key_1": "Tea, Earl Grey, Hot",
						"notes_key_2": "Tea, Earl Grey… decaf."
					}
				}
			},
			"queue_if_low_balance": true,
			"reference_id": "Acme Transaction ID 12345",
			"narration": "Acme Corp Fund Transfer",
			"notes": {
				"notes_key_1": "Beam me up Scotty",
				"notes_key_2": "Engage"
			}
		}, {
			auth: {
				username: "rzp_test_GNQkhXFxhvLIs9",
				password: "AilZ8MAsNXItdgo5G5WIgbLp"
			}
		})
		.then((res) => {
			console.log(res)
		})
	})

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
