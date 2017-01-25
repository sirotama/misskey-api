import {logInfo, logDone, logWarn} from 'log-cool';
import {execSync} from 'child_process';

export default function(): void {
	checkDependency('Node.js', 'node -v', x => x.match(/^v(.*)\r?\n$/)[1]);
	checkDependency('npm', 'npm -v', x => x.match(/^(.*)\r?\n$/)[1]);
	checkDependency('MongoDB', 'mongo --version', x => x.match(/^MongoDB shell version: (.*)\r?\n$/)[1]);
	checkDependency('Redis', 'redis-server --version', x => x.match(/v=([0-9\.]*)/)[1]);
	logDone('Checked external dependencies');
}

function checkDependency(serviceName: string, command: string, transform: (x: string) => string): void {
	try {
		const x = execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] });
		const ver = transform(x.toString());
		if (ver != null) {
			logInfo(`${serviceName} ${transform(stdout.toString())}`);
		} else {
			logWarn(`Check dependencies error (${serviceName})`);
			logWarn(`Regexp used for version check of ${serviceName} is probably messed up`);
		}
	} catch (e) {
		logWarn(`Check dependencies error (${serviceName})`);
	}
}
