type WorkflowParams = Record<string, any>;

export interface WorkflowSpecs<Params extends WorkflowParams> {}

export class Workflow<
  Params extends WorkflowParams,
  WorkflowType extends WorkflowSpecs<Params>,
> {
  constructor(
    private specs: WorkflowType,
    private params: Params,
    private workflowDir: string,
  ) {}
  async prepare() {}
  async run() {}
  async clean() {}
  private async _prepareFolder() {}
  private async _prepareConfig() {}
  private async _collectData() {}
  private async _prepareFiles() {}
  private async _prepareEnvironment() {}
}
