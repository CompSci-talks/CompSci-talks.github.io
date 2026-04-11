// scripts/e2e/helpers/report-formatter.js
const { Formatter } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

class MarkdownFormatter extends Formatter {
    constructor(options) {
        super(options);
        this.reportPath = path.join(process.cwd(), 'specs', '012-e2e-app-flow-verify', 'walkthrough.md');
        this.report = '# E2E Verification Report\n\n';

        options.eventBroadcaster.on('envelope', (envelope) => {
            if (envelope.testCaseFinished) {
                this.onTestCaseFinished(envelope.testCaseFinished);
            } else if (envelope.testRunFinished) {
                this.onTestRunFinished(envelope.testRunFinished);
            }
        });
    }

    onTestCaseFinished(testCaseFinished) {
        // Basic capturing of Gherkin steps and result
        // In a real implementation, you'd match the testCaseId to the pickle
        const status = testCaseFinished.willBeRetried ? 'RETRY' : (testCaseFinished.testStepResults ? 'FINISHED' : 'UNKNOWN');
        this.report += `### Scenario: ${status}\n\n`;
    }

    onTestRunFinished() {
        fs.writeFileSync(this.reportPath, this.report);
    }
}

module.exports = MarkdownFormatter;
