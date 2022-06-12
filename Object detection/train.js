// const model = tf.sequential(); //tf.sequential() => Outputs from one layer are inputs to the next, a simple tack of layers with no branching or skipping

// //Start of model architecture
// model.add(tf.layers.dense({units: 1, inputShape:[1]})); //dense layer => A dense means all of the nodes in each of the layers are conectes are connected to each other
// //End of model architecture
// model.compile({
// 	loss: 'meansquaredError',
// 	optimizer: 'sgd'
// });

// const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]); // inputs
// const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);// outputs
// await model.fit(xs, ys, {epochs: 1000}).then(()=>{
// 	model.predict(tf.tensor2d([20], [1])); // THIS IS THE TRAINING OUTPUT
// });

const NUM_OF_EPOCHS = 100000;
const VEHICLE_CLASSES = ['Truck', 'Bus', 'MiniBus', 'Van', 'SUV', 'Sedan'];
const PLATE_CLASSES = ['LicencePlate', 'Random'];
const NUM_OF_VEHICLE_CLASSES = VEHICLE_CLASSES.length;
const NUM_OF_PLATE_CLASSES = PLATE_CLASSES.length;
const VEHICLE_DATA = []; //This is the variable that will hold the labeled data that will be processed for feeding into the network
const PLATE_DATA = []; //This is the variable that will hold the labeled data that will be processed for feeding into the network

const img = document.getElementById('img');
function convertToTensors(data, targets, testSplit) {
	const numExamples = data.length;
	if (numExamples !=== targets.length) { throw new Error("Data and splits have different numbers of examples"); };
	const numTestExamples = Math.round(numExamples*testSpit);
	const numTrainExamples = numExamples - numTestExamples;

	const xDims = data[0].length;

	//Create 2d tensor to hold the feature data
	const xs = tf.tensor2d(data, [numExamples, xDims]);

	//Create 1d tf Tensor to hold the labels, and convert the number label
	//from the set [0, 1, 2] into one hot encoding (e.g 0->[1, 0, 0])
	const ys = tf.oneHot(tf.tensor1d(targets).toInt(), NUM_OF_VEHICLE_CLASSES);

	//Split teh data into trainng and testing sets, using 'slice'
	const xTrain = xs.slice([0,0], [numTrainExamples, xDims]);
	const yTrain = ys.slice([numTrainExamples,0], [numTestExamples, xDims]);
	const xTest = ys.slice([0,0], [numTrainExamples, NUM_OF_VEHICLE_CLASSES]);
	const yTest = ys.slice([0,0], [numTestExamples, NUM_OF_VEHICLE_CLASSES]);

	return [xTrain, yTrain, xTest, yTest];
};
function getFullData(testSpit) {
	return tf.tidy(()=>{
		const dataByClass = [];
		const targetsByClass = [];
		VEHICLE_CLASSES.forEach(()=>{
			dataByClass.push([]);
			targetsByClass.push([]);
		});
		for (const example of VEHICLE_DATA) {
			const target = example[example.length-1];
			const data = example.slice(0, example.length-1);
			dataByClass[target].push(data);
			targetsByClass[target].push(target);
		};
		const xTrain = [];
		const yTrain = [];
		const xTest = [];
		const yTest = [];
		for (let i = 0; i < VEHICLE_CLASSES.length; i++) {
			const [xTrai, yTrai, xTes, yTes] = convertToTensors(dataByClass[i], targetsByClass[i], testSpit);
			xTrain.push(xTrai);
			yTrain.push(yTrai);
			xTest.push(xTes);
			yTest.push(yTes);
		};

		const concatAxis = 0;
		return [tf.concat(xTrain,concatAxis), tf.concat(yTrain,concatAxis), tf.concat(xTest,concatAxis), tf.concat(yTest,concatAxis)];
	});
};
async function trainModel(xTrain, yTrain, xTest, yTest) {
	const model = await cocoSsd.load(document.getElementById('objectDetectionModel').value);
	const history = await model.fit(xTrain, yTrain, {epochs: NUM_OF_EPOCHS, validation: [xTest, yTest], 
		callbacks: {
			onEpochEnd: async () => {
				console.log("Epoch: "+epoch+" logs: "+logs.loss);
				await tf.nextFrame();
			},
		}
	});
	return model;
};

async function doDetectionTraining() {
	const [xTrain, yTrain, xTest, yTest] = getFullData(0.2);
	model = await trainModel(xTrain, yTrain, xTest, yTest);
	return model;
};
doDetectionTraining().then(model=>{
	model.detect(img).then(predictions => {
		console.log('Predictions: ', predictions);
	});
});