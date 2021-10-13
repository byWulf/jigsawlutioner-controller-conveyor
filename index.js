import Controller from 'jigsawlutioner-controller/Controller.js';

const controller = new Controller(3000);

controller.createEndpoint('reset', async (parameters, resolve) => {
    const motor = await controller.getMotor(parameters.motor);
    const sensor = await controller.getSensor(parameters.sensor);

    await motor.setPower(-50);

    await waitUntilNextPlate(sensor);

    await motor.setPower(0);

    await motor.resetEncoder();

    if (parameters.additionalForward) {
        await motor.setPosition(-parseInt(parameters.additionalForward, 10), 50);
        await motor.setPower(0);
        await motor.resetEncoder();
    }
});

controller.createEndpoint('move-to-next-plate', async (parameters, resolve) => {
    const partsPerRotation = 10;
    const partsPerPlate = 6;

    const movement= -(partsPerPlate / partsPerRotation * 360);

    const motor = await controller.getMotor(parameters.motor);

    await motor.setPosition(movement, 50);
    await motor.setPower(0);

    await motor.setEncoder(movement);
});

async function waitUntilNextPlate(sensor) {
    return new Promise((resolve) => {
        let wasFree = false;

        sensor.watch(async (err, value) => {
            if (value === 1 && !wasFree) {
                wasFree = true;
            }

            if (value === 0 && wasFree) {
                sensor.unwatch();
                resolve();
            }
        });
    });
}
