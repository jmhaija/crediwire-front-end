import RootView from 'views/RootView'
import LoginView from 'views/LoginView'
import AccountView from 'views/AccountView'
import LanguageView from 'views/LanguageView'
import RegisterView from 'views/RegisterView'
import LogoutView from 'views/LogoutView'
import UnsupportedView from 'views/UnsupportedView'
import NewTosView from 'views/NewTosView'
import ForgotView from 'views/ForgotView'
import RecoverView from 'views/RecoverView'
import CreateCompanyView from 'views/CreateCompanyView'
import CompanyView from 'views/CompanyView'
import CompanySettingsView from 'views/CompanySettingsView'
import CompanyErpView from 'views/CompanyErpView'
import CompanyMappingView from 'views/CompanyMappingView'
import PartnerView from 'views/PartnerView'
import ConnectErpView from 'views/ConnectErpView'
import SetupView from 'views/SetupView'
import ClientView from 'views/ClientView'
import ProfileView from 'views/ProfileView'
import ProfileInfoView from 'views/ProfileInfoView'
import ProfilePasswordView from 'views/ProfilePasswordView'
import OverviewView from 'views/OverviewView.vue'
import ManageDashboardsView from 'views/ManageDashboardsView'
import ManageKpisView from 'views/ManageKpisView'
import ConnectionsView from 'views/ConnectionsView'
import ConnectionsListView from 'views/ConnectionsListView'
import SummaryView from 'views/SummaryView'
import CompanyUserView from 'views/CompanyUserView'
import HelpView from 'views/HelpView'
import WarningsView from 'views/WarningsView'
import ConnectXenaView from 'views/ConnectXenaView'
import ConnectSegesView from 'views/ConnectSegesView'
import CompanySetupView from 'views/CompanySetupView'
import ExportView from 'views/ExportView'
import UpdatingView from 'views/UpdatingView'
import InvitationsView from 'views/InvitationsView'
import ProcessInviteView from 'views/ProcessInviteView'
import InvitationMetricsView from 'views/InvitationMetricsView'
import DeclineInvitationView from 'views/DeclineInvitationView'
import TimeoutView from 'views/TimeoutView'
import SegesPendingView from 'views/SegesPendingView'
import StatsView from 'views/StatsView'
import ProcessUserInviteView from 'views/ProcessUserInviteView'
import ConnectAccountView from 'views/ConnectAccountView'
import SetupUserView from 'views/SetupUserView'
import ConnectCompanyView from 'views/ConnectCompanyView'
import BudgetView from 'views/BudgetView'
import CompanyLeaveView from 'views/CompanyLeaveView'
import CompanyDeleteView from 'views/CompanyDeleteView'
import CompanyLogoView from 'views/CompanyLogoView'
import ConnectDineroView from 'views/ConnectDineroView'
import CompanyStatsView from 'views/CompanyStatsView'
import InvitationExpiredView from 'views/InvitationExpiredView'
import SalesPotentialView from 'views/SalesPotentialView'
import SpecificTosView from 'views/SpecificTosView'
import PresentationView from 'views/PresentationView'
import CompanyApprovalView from 'views/CompanyApprovalView'
import CoronaLandingView from 'views/CoronaLandingView'
import CoronaReportMailJumpPage from 'views/CoronaReportMailJumpPage'
import CoronaReportLinkJumpPage from 'views/CoronaReportLinkJumpPage'
import notFound from 'views/404'

const routes = [
    { path: '/', component: RootView },
    { path: '/login', component: LoginView },
    { path: '/language', component: LanguageView },
    { path: '/register', component: RegisterView },
    { path: '/logout', component: LogoutView },
    { path: '/unsupported', component: UnsupportedView },
    { path: '/new-tos', component: NewTosView },
    { path: '/spec-tos', component: SpecificTosView },
    { path: '/forgot', component: ForgotView },
    { path: '/recover', component: RecoverView },
    { path: '/setup', component: SetupView },
    { path: '/setup-user', component: SetupUserView },
    { path: '/connect/xena', component: ConnectXenaView },
    { path: '/connect/seges', component: ConnectSegesView },
    { path: '/connect-dinero', component: ConnectDineroView },
    { path: '/connect/:provider/:company?/:country?', component: ConnectErpView },
    { path: '/connect-account', component: ConnectAccountView },
    { path: '/not-found', component: notFound },
    {
        path: '/account', component: AccountView, children: [
            { path: 'create-company', component: CreateCompanyView },
            { path: 'company-setup', component: CompanySetupView },
            { path: 'connect-company', component: ConnectCompanyView },
            {
                path: 'company', component: CompanyView, children: [
                    { path: 'settings', component: CompanySettingsView },
                    { path: 'erp', component: CompanyErpView },
                    { path: 'mapping', component: CompanyMappingView },
                    { path: 'users', component: CompanyUserView },
                    { path: 'leave-company', component: CompanyLeaveView },
                    { path: 'delete-company', component: CompanyDeleteView },
                    { path: 'logo', component: CompanyLogoView }

                ]
            },
            {
                path: 'profile', component: ProfileView, children: [
                    { path: 'info', component: ProfileInfoView },
                    { path: 'password', component: ProfilePasswordView }
                ]
            },
            {
                path: 'overview', component: OverviewView, children: [
                    { path: 'generaloverview', component: OverviewView },
                    { path: 'trialbalance', component: OverviewView },
                    { path: 'financialreport', component: OverviewView },
                    { path: 'annualreport', component: OverviewView },
                    { path: 'makeclientreport', component: OverviewView },
                    { path: 'invoices', component: OverviewView },
                    {
                        path: 'budget', component: OverviewView, children: [
                            { path: 'importexport', component: OverviewView },
                            { path: 'budgetversions', component: OverviewView },
                            { path: 'budgetperiods', component: OverviewView },
                        ]
                    },
                    { path: 'reports-file-upload', component: OverviewView },
                ]
            },
            { path: 'dashboards', component: ManageDashboardsView },
            { path: 'kpis', component: ManageKpisView },
            {
                path: 'connections', component: ConnectionsView, children: [
                    {
                        path: 'all',
                        component: ConnectionsListView,
                        meta: { connectionType: 'see', filter: 'all' }
                    },
                    {
                        path: 'portfolio',
                        component: ConnectionsListView,
                        meta: { connectionType: 'see', filter: 'portfolio' }
                    },
                    {
                        path: 'shared',
                        component: ConnectionsListView,
                        meta: { connectionType: 'show', filter: 'all' }
                    }
                ]
            },
            {
                path: 'connections/:id', redirect: function (to) {
                    return { path: 'connections/all', query: { id: to.params.id } };
                }
            },
            { path: 'summary', component: SummaryView },
            { path: 'help', component: HelpView },
            { path: 'warnings', component: WarningsView },
            { path: 'updating', component: UpdatingView },
            { path: 'invitations', component: InvitationsView },
            { path: 'process-invite', component: ProcessInviteView },
            { path: 'process-user-invite', component: ProcessUserInviteView },
            { path: 'invitation-metrics', component: InvitationMetricsView },
            { path: 'seges-pending', component: SegesPendingView },
            { path: 'stats', component: StatsView },
            { path: 'company-stats', component: CompanyStatsView },
            { path: 'budget', component: BudgetView },
            { path: 'sales-potential', component: OverviewView },
            { path: 'sales-potential-2', component: OverviewView }
        ]
    },
    { path: '/nykredit/:view?', component: PartnerView, meta: { partner: 'nykredit' } },
    { path: '/nordea/:view?', component: PartnerView, meta: { partner: 'nordea' } },
    { path: '/ttrevision/:view?', component: PartnerView, meta: { partner: 'ttrevision' } },
    { path: '/augusta/:view?', component: PartnerView, meta: { partner: 'augusta' } },
    { path: '/hvb/:view?', component: PartnerView, meta: { partner: 'hvb' } },
    { path: '/bank/:view?', component: PartnerView, meta: { partner: 'bank' } },
    { path: '/spks/:view?', component: PartnerView, meta: { partner: 'spks' } },
    { path: '/youlend/:view?', component: PartnerView, meta: { partner: 'youlend' } },
    { path: '/vaekstfonden/:view?', component: PartnerView, meta: { partner: 'vaekstfonden' } },
    { path: '/midspar/:view?', component: PartnerView, meta: { partner: 'midspar' } },
    { path: '/kpmg/:view?', component: PartnerView, meta: { partner: 'kpmg' } },
    { path: '/al-bank/:view?', component: PartnerView, meta: { partner: 'albank' } },
    { path: '/sydbank/:view?', component: PartnerView, meta: { partner: 'sydbank' } },
    { path: '/jyske-bank/:view?', component: PartnerView, meta: { partner: 'jyske' } },
    { path: '/sparkron/:view?', component: PartnerView, meta: { partner: 'sparkron' } },
    { path: '/fsr/:view?', component: PartnerView, meta: { partner: 'fsr' } },
    { path: '/ikano/:view?', component: PartnerView, meta: { partner: 'ikano' } },
    { path: '/client', component: ClientView },
    { path: '/client-app', component: ClientView },
    { path: '/app', component: ClientView },
    { path: '/export', component: ExportView },
    { path: '/decline-invitation', component: DeclineInvitationView },
    { path: '/session-timeout', component: TimeoutView },
    { path: '/invitation-expired', component: InvitationExpiredView },
    { path: '/presentation', component: PresentationView },
    { path: '/company-approval', component: CompanyApprovalView },
    {
        path: '/sparkron-corona/:sub?',
        component: CoronaLandingView,
        meta: { partner: 'sparkron', generic: false, logo: 'sparkron.png' }
    },
    {
        path: '/nordea-corona/:sub?',
        component: CoronaLandingView,
        meta: { partner: 'nordea', generic: false, logo: 'nordea.png' }
    },
    {
        path: '/dinero-corona/:sub?',
        component: CoronaLandingView,
        meta: { partner: 'dinero', generic: true, logo: 'dinero.jpg' }
    },
    {
        path: '/economic-corona/:sub?',
        component: CoronaLandingView,
        meta: { partner: 'economic', generic: true, logo: 'economic.png' }
    },
    {
        path: '/billy-corona/:sub?',
        component: CoronaLandingView,
        meta: { partner: 'billy', generic: true, logo: 'billy.png' }
    },
    { path: '/l/covid-rapporter', component: CoronaReportLinkJumpPage },
    { path: '/m/covid-rapporter', component: CoronaReportMailJumpPage },
    { path: '*', redirect: '/' }
];

export default routes
