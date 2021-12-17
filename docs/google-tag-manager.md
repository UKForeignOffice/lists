# Google Tag Manager

Google Tag Manager is used on the application to load in Google Analytics. There are 4 different tag manager IDs used on the application - two a piece for the Find A... application and another 2 for the Form Runner.

The GTM IDs for the Form Runner are set using the `GTM_ID_1` and `GTM_ID_2` environment variables.

The GTM IDs for the Find A... application are hard coded in `layout.njk` file in `src/server/views` folder.

## Content Security Policy (CSP)

Both applications have CSPs set in order to limit what can be loaded for security purposes.

Because the scripts loaded by Tag Manager can change to break those security policies, you will need to ensure that any changes made do not fall foul of the policy set. If they do, you will need to update the CSP in two locations.

For the Find A... application, you will need to update `helmet.ts` in the `src/server/middlewares` folder.

For the Form Runner, you will need to update `blankie.ts` in the `runner/src/server/plugins` folder. The Form Runner resides in the [XGovFormBuilder/digital-form-builder](https://github.com/XGovFormBuilder/digital-form-builder) repo. Once you make the change to the Form Runner, you will need to create a new release and point to that when ready.

You can update the version of the Form Runner used by editing Line 16 of `install-form-runner.sh` in the `src/server/components/formRunner` folder.
