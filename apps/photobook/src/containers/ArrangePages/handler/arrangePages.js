export const onAddPages = (that) => {
  const { boundProjectActions } = that.props;
  boundProjectActions.createDualPage();
};
