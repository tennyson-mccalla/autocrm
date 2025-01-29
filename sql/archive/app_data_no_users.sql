--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tickets VALUES ('b31f9ab4-e3ef-40f6-8824-17d1658314d9', 'Urgent Issue - System Down', 'The entire system is not responding to user requests.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.736973+00', '2025-01-25 00:55:31.736973+00');
INSERT INTO public.tickets VALUES ('7b564eac-94a2-4eb4-a197-4df9bc243940', 'High Priority Bug', 'Users cannot save their work in the editor.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.756543+00', '2025-01-25 00:55:31.756543+00');
INSERT INTO public.tickets VALUES ('5800136f-06ac-4b63-bc9d-efb26934d662', 'Feature Request', 'Would like to have dark mode support.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.764013+00', '2025-01-25 00:55:31.764013+00');
INSERT INTO public.tickets VALUES ('f6c269bc-015c-4835-85f3-a023ee01b8bc', 'Documentation Update', 'Found a typo in the API documentation.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.768345+00', '2025-01-25 00:55:31.768345+00');
INSERT INTO public.tickets VALUES ('8b9c5efa-595e-4c15-81ad-c180ae30d9b3', 'Performance Issue', 'The application is running slowly during peak hours.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.77158+00', '2025-01-25 00:55:31.77158+00');
INSERT INTO public.tickets VALUES ('eb69954a-9d41-4a99-8cbb-ac8229d0e89a', 'Mobile Responsiveness', 'Website does not display correctly on mobile devices.', 'open', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.775252+00', '2025-01-25 00:55:31.775252+00');
INSERT INTO public.tickets VALUES ('b78747f5-c21c-4725-9ca3-f6d9351f12f7', 'Login Issues', 'Some users are unable to log in using their credentials.', 'new', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.779071+00', '2025-01-25 00:55:31.779071+00');
INSERT INTO public.tickets VALUES ('2954be2a-def7-4afc-b503-6321505553a2', 'Data Export Feature', 'Need ability to export data to CSV format.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.782839+00', '2025-01-25 00:55:31.782839+00');
INSERT INTO public.tickets VALUES ('48eb781d-9191-4e58-8c5f-1f01ba44f9e5', 'Security Concern', 'Potential security vulnerability in authentication.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.786694+00', '2025-01-25 00:55:31.786694+00');
INSERT INTO public.tickets VALUES ('37c8d903-f7e4-41be-9522-8447f52202f3', 'UI Enhancement', 'Request for improved navigation menu.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.789462+00', '2025-01-25 00:55:31.789462+00');
INSERT INTO public.tickets VALUES ('20fdadb7-ae8c-4fb6-b59e-f62c236aa73c', 'Website Down', 'Our company website is not loading', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.791561+00', '2025-01-25 00:55:31.791561+00');
INSERT INTO public.tickets VALUES ('ff256453-8d9c-423c-ac9f-16b8c3373855', 'Email Not Working', 'Cannot send or receive emails', 'in_progress', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.794497+00', '2025-01-25 00:55:31.794497+00');
INSERT INTO public.tickets VALUES ('7035415c-f869-407b-9244-82f1710deacc', 'Printer Issues', 'Office printer not connecting to network', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:31.79846+00', '2025-01-25 00:55:31.79846+00');
INSERT INTO public.tickets VALUES ('4ff46d3f-0e46-4efe-8d77-70a07710488d', 'Urgent Issue - System Down', 'The entire system is not responding to user requests.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.031949+00', '2025-01-25 00:55:56.031949+00');
INSERT INTO public.tickets VALUES ('13688057-c0a2-4a8c-bd76-3ea9d20403f1', 'High Priority Bug', 'Users cannot save their work in the editor.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.037215+00', '2025-01-25 00:55:56.037215+00');
INSERT INTO public.tickets VALUES ('0c26cab5-1e4c-4d09-863e-05e6c375ec0b', 'Feature Request', 'Would like to have dark mode support.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.041024+00', '2025-01-25 00:55:56.041024+00');
INSERT INTO public.tickets VALUES ('6c72d694-a0a1-469e-8d0b-f884b72d74cb', 'Documentation Update', 'Found a typo in the API documentation.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.051072+00', '2025-01-25 00:55:56.051072+00');
INSERT INTO public.tickets VALUES ('f8a386e3-bba2-4b91-a75a-65362f19e756', 'Performance Issue', 'The application is running slowly during peak hours.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.055351+00', '2025-01-25 00:55:56.055351+00');
INSERT INTO public.tickets VALUES ('bc0f9c95-dc42-4bb3-8e1d-7f899083828a', 'Mobile Responsiveness', 'Website does not display correctly on mobile devices.', 'open', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.059464+00', '2025-01-25 00:55:56.059464+00');
INSERT INTO public.tickets VALUES ('f8ef1961-77cd-4744-b8d3-34edace3952c', 'Login Issues', 'Some users are unable to log in using their credentials.', 'new', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.063241+00', '2025-01-25 00:55:56.063241+00');
INSERT INTO public.tickets VALUES ('2f567dff-c0e9-4c8d-9bfe-2f2e94217757', 'Data Export Feature', 'Need ability to export data to CSV format.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.067277+00', '2025-01-25 00:55:56.067277+00');
INSERT INTO public.tickets VALUES ('7e318695-3566-4f6c-bdb0-76cac5dc960e', 'Security Concern', 'Potential security vulnerability in authentication.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.070307+00', '2025-01-25 00:55:56.070307+00');
INSERT INTO public.tickets VALUES ('782fdb0c-0d9d-44ff-bb9f-3cf2de54ab28', 'UI Enhancement', 'Request for improved navigation menu.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.07321+00', '2025-01-25 00:55:56.07321+00');
INSERT INTO public.tickets VALUES ('be52184e-1d1a-4474-a7dd-031beb17cef8', 'Website Down', 'Our company website is not loading', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.075608+00', '2025-01-25 00:55:56.075608+00');
INSERT INTO public.tickets VALUES ('36abfe0d-b067-4e9e-8973-46a801fa4110', 'Email Not Working', 'Cannot send or receive emails', 'in_progress', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.07863+00', '2025-01-25 00:55:56.07863+00');
INSERT INTO public.tickets VALUES ('79ea408d-bc5b-480e-9a40-9df2f0c24058', 'Printer Issues', 'Office printer not connecting to network', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:55:56.081214+00', '2025-01-25 00:55:56.081214+00');
INSERT INTO public.tickets VALUES ('1c2c7501-4d04-4433-9ce3-fdb0bee21ec8', 'Urgent Issue - System Down', 'The entire system is not responding to user requests.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.665366+00', '2025-01-25 00:57:36.665366+00');
INSERT INTO public.tickets VALUES ('93e2d823-119e-4615-8cf2-c2ef4ebe34d5', 'High Priority Bug', 'Users cannot save their work in the editor.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.678509+00', '2025-01-25 00:57:36.678509+00');
INSERT INTO public.tickets VALUES ('91a6db6d-3e42-4836-bb3c-0bd461ec9568', 'Feature Request', 'Would like to have dark mode support.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.685042+00', '2025-01-25 00:57:36.685042+00');
INSERT INTO public.tickets VALUES ('8b0ec524-4487-425f-8e55-1cdb0ce02326', 'Documentation Update', 'Found a typo in the API documentation.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.689228+00', '2025-01-25 00:57:36.689228+00');
INSERT INTO public.tickets VALUES ('0f2f0b4b-aa99-446c-a4c1-dca7815a41b4', 'Performance Issue', 'The application is running slowly during peak hours.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.69286+00', '2025-01-25 00:57:36.69286+00');
INSERT INTO public.tickets VALUES ('8c7060fb-9c47-4ad6-a1ff-b72ea6e67a19', 'Mobile Responsiveness', 'Website does not display correctly on mobile devices.', 'open', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.696919+00', '2025-01-25 00:57:36.696919+00');
INSERT INTO public.tickets VALUES ('79a1e0ea-7ebf-4e1b-8116-cf853e7c1e19', 'Login Issues', 'Some users are unable to log in using their credentials.', 'new', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.702511+00', '2025-01-25 00:57:36.702511+00');
INSERT INTO public.tickets VALUES ('e0516e8b-498d-4a16-b5d1-171053caee37', 'Data Export Feature', 'Need ability to export data to CSV format.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.706938+00', '2025-01-25 00:57:36.706938+00');
INSERT INTO public.tickets VALUES ('f0f0ca90-d99b-4670-ac99-12117eeab444', 'Security Concern', 'Potential security vulnerability in authentication.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.710716+00', '2025-01-25 00:57:36.710716+00');
INSERT INTO public.tickets VALUES ('b5043f6a-9bb9-4933-bac3-0c5e511e1267', 'UI Enhancement', 'Request for improved navigation menu.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.713515+00', '2025-01-25 00:57:36.713515+00');
INSERT INTO public.tickets VALUES ('1cb4d29d-88f6-47c0-8470-2bd41a56f37a', 'Website Down', 'Our company website is not loading', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.715911+00', '2025-01-25 00:57:36.715911+00');
INSERT INTO public.tickets VALUES ('19149091-b1b7-416c-bb11-91a5e691281e', 'Email Not Working', 'Cannot send or receive emails', 'in_progress', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.719006+00', '2025-01-25 00:57:36.719006+00');
INSERT INTO public.tickets VALUES ('5461a780-6dc6-4147-98b5-b0e75cef6d6a', 'Printer Issues', 'Office printer not connecting to network', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:57:36.721409+00', '2025-01-25 00:57:36.721409+00');
INSERT INTO public.tickets VALUES ('0fa56bb9-fc7a-4a17-abb7-558ed80bfc7d', 'Urgent Issue - System Down', 'The entire system is not responding to user requests.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.248397+00', '2025-01-25 00:58:03.248397+00');
INSERT INTO public.tickets VALUES ('1ccf8e80-e642-4318-9364-f9bfd0e1b95b', 'High Priority Bug', 'Users cannot save their work in the editor.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.253249+00', '2025-01-25 00:58:03.253249+00');
INSERT INTO public.tickets VALUES ('fbd5aa31-a951-4c61-bf54-dfd57040c21e', 'Feature Request', 'Would like to have dark mode support.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.256998+00', '2025-01-25 00:58:03.256998+00');
INSERT INTO public.tickets VALUES ('168e98bf-f3c0-4e9c-98b1-ddab97f4a719', 'Documentation Update', 'Found a typo in the API documentation.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.261394+00', '2025-01-25 00:58:03.261394+00');
INSERT INTO public.tickets VALUES ('7e1a14e4-6759-40a1-8ecf-e619bc935126', 'Performance Issue', 'The application is running slowly during peak hours.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.265106+00', '2025-01-25 00:58:03.265106+00');
INSERT INTO public.tickets VALUES ('dd607184-270d-4fa2-a923-c4f2c2ad3bca', 'Mobile Responsiveness', 'Website does not display correctly on mobile devices.', 'open', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.268721+00', '2025-01-25 00:58:03.268721+00');
INSERT INTO public.tickets VALUES ('3ff64848-49a9-4780-86cc-7556f5b2e314', 'Login Issues', 'Some users are unable to log in using their credentials.', 'new', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.273077+00', '2025-01-25 00:58:03.273077+00');
INSERT INTO public.tickets VALUES ('61815f61-69a7-4bfe-a75f-7c0c12ce2b23', 'Data Export Feature', 'Need ability to export data to CSV format.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.277712+00', '2025-01-25 00:58:03.277712+00');
INSERT INTO public.tickets VALUES ('6273d543-32cb-4836-aca4-66b188e16374', 'Security Concern', 'Potential security vulnerability in authentication.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.28165+00', '2025-01-25 00:58:03.28165+00');
INSERT INTO public.tickets VALUES ('e63a43d8-8bac-495b-a303-3fc5cce29351', 'UI Enhancement', 'Request for improved navigation menu.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.284473+00', '2025-01-25 00:58:03.284473+00');
INSERT INTO public.tickets VALUES ('89216199-d926-4f93-86ab-b3bf0d95ed7a', 'Website Down', 'Our company website is not loading', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.287069+00', '2025-01-25 00:58:03.287069+00');
INSERT INTO public.tickets VALUES ('e32760e9-d600-4270-bdd9-dc8903f35c6c', 'Printer Issues', 'Office printer not connecting to network', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.293572+00', '2025-01-25 00:58:03.293572+00');
INSERT INTO public.tickets VALUES ('e375592a-a65b-449f-a70b-e58f69640a5c', 'Urgent Issue - System Down', 'The entire system is not responding to user requests.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.120119+00', '2025-01-25 00:58:18.120119+00');
INSERT INTO public.tickets VALUES ('d120aeb3-6742-4279-bc2b-f28a23fe46ac', 'Feature Request', 'Would like to have dark mode support.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.130719+00', '2025-01-25 00:58:18.130719+00');
INSERT INTO public.tickets VALUES ('65144945-c679-45aa-8369-d92dbb556b47', 'Performance Issue', 'The application is running slowly during peak hours.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.138068+00', '2025-01-25 00:58:18.138068+00');
INSERT INTO public.tickets VALUES ('42101a90-2167-43d4-a997-2684ba84b227', 'Login Issues', 'Some users are unable to log in using their credentials.', 'new', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.15072+00', '2025-01-25 00:58:18.15072+00');
INSERT INTO public.tickets VALUES ('bad7aab8-8f28-48ca-b608-0b92a0269035', 'Security Concern', 'Potential security vulnerability in authentication.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.160232+00', '2025-01-25 00:58:18.160232+00');
INSERT INTO public.tickets VALUES ('803b37f6-a3ac-406c-929d-e7e65faf932c', 'Website Down', 'Our company website is not loading', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.166626+00', '2025-01-25 00:58:18.166626+00');
INSERT INTO public.tickets VALUES ('7d367823-d994-432a-a7a8-eacce410f5b2', 'Printer Issues', 'Office printer not connecting to network', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.173318+00', '2025-01-25 00:58:18.173318+00');
INSERT INTO public.tickets VALUES ('1c8a0a4e-5fe8-42ab-985f-3360e56bc505', 'Email Not Working', 'Cannot send or receive emails', 'in_progress', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:03.290671+00', '2025-01-25 00:58:03.290671+00');
INSERT INTO public.tickets VALUES ('e96d1eec-2ba5-490f-bc58-51b50bfd61df', 'High Priority Bug', 'Users cannot save their work in the editor.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.126626+00', '2025-01-25 00:58:18.126626+00');
INSERT INTO public.tickets VALUES ('d0174153-2959-47d6-8d9f-29c2959ba304', 'Documentation Update', 'Found a typo in the API documentation.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.134281+00', '2025-01-25 00:58:18.134281+00');
INSERT INTO public.tickets VALUES ('9e250470-9b55-49aa-b923-608bbc7a86fc', 'Mobile Responsiveness', 'Website does not display correctly on mobile devices.', 'open', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.143447+00', '2025-01-25 00:58:18.143447+00');
INSERT INTO public.tickets VALUES ('aae5b007-b88e-4838-a305-e5e1ac062e1a', 'Data Export Feature', 'Need ability to export data to CSV format.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.156078+00', '2025-01-25 00:58:18.156078+00');
INSERT INTO public.tickets VALUES ('32555a3a-4062-4de6-95ce-081f355be2ff', 'UI Enhancement', 'Request for improved navigation menu.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.163921+00', '2025-01-25 00:58:18.163921+00');
INSERT INTO public.tickets VALUES ('348c8e84-93de-41ad-b603-ea793e91a6a2', 'Email Not Working', 'Cannot send or receive emails', 'in_progress', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:18.169778+00', '2025-01-25 00:58:18.169778+00');
INSERT INTO public.tickets VALUES ('7682e4ab-d76c-4e01-918a-cec2c97a46ef', 'Urgent Issue - System Down', 'The entire system is not responding to user requests.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.63643+00', '2025-01-25 00:58:46.63643+00');
INSERT INTO public.tickets VALUES ('a47ef01d-df96-4a18-8a03-1ee39933d45c', 'High Priority Bug', 'Users cannot save their work in the editor.', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.642742+00', '2025-01-25 00:58:46.642742+00');
INSERT INTO public.tickets VALUES ('6bd3a2ec-68cc-4aa8-82f5-b3f736e9ecb5', 'Feature Request', 'Would like to have dark mode support.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.646716+00', '2025-01-25 00:58:46.646716+00');
INSERT INTO public.tickets VALUES ('11e5dd48-ce6f-4551-a6b8-37d6a54075b2', 'Documentation Update', 'Found a typo in the API documentation.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.650605+00', '2025-01-25 00:58:46.650605+00');
INSERT INTO public.tickets VALUES ('f676d5f8-2a1d-45c9-9c61-4eff66fe5ced', 'Performance Issue', 'The application is running slowly during peak hours.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.654384+00', '2025-01-25 00:58:46.654384+00');
INSERT INTO public.tickets VALUES ('e39e11ae-32d8-430e-89da-10f51be86d3b', 'Mobile Responsiveness', 'Website does not display correctly on mobile devices.', 'open', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.65773+00', '2025-01-25 00:58:46.65773+00');
INSERT INTO public.tickets VALUES ('17810480-80ea-4a77-8cac-1eddb2eaae4f', 'Login Issues', 'Some users are unable to log in using their credentials.', 'new', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.661506+00', '2025-01-25 00:58:46.661506+00');
INSERT INTO public.tickets VALUES ('07d03e43-55a3-4bae-b344-72d6e4b5f5de', 'Data Export Feature', 'Need ability to export data to CSV format.', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.665753+00', '2025-01-25 00:58:46.665753+00');
INSERT INTO public.tickets VALUES ('9f840b12-f25c-491a-980b-b676f0592e54', 'Security Concern', 'Potential security vulnerability in authentication.', 'in_progress', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.669759+00', '2025-01-25 00:58:46.669759+00');
INSERT INTO public.tickets VALUES ('87815476-1775-4dcb-ad48-862dd3133a4b', 'UI Enhancement', 'Request for improved navigation menu.', 'new', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.673223+00', '2025-01-25 00:58:46.673223+00');
INSERT INTO public.tickets VALUES ('4edd58fb-1b31-4669-a5f4-7ba26a55aee6', 'Website Down', 'Our company website is not loading', 'open', 'high', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.675672+00', '2025-01-25 00:58:46.675672+00');
INSERT INTO public.tickets VALUES ('ddead744-8e98-403e-9491-3da3477af816', 'Printer Issues', 'Office printer not connecting to network', 'open', 'low', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', NULL, '2025-01-25 00:58:46.680724+00', '2025-01-25 00:58:46.680724+00');
INSERT INTO public.tickets VALUES ('6fa809a1-8116-455f-82d5-7eb2b711e7cf', 'Email Not Working', 'Cannot send or receive emails', 'in_progress', 'medium', '{}', '8fcb8bab-88b1-401e-bfd0-983ff58c7107', 'bb12933a-784a-4b7c-93d7-1daeb06d815f', '2025-01-25 00:58:46.678008+00', '2025-01-25 01:06:58.313778+00');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.queues VALUES ('b90d300c-c215-4489-a6fd-65d3b50903e8', 'Technical Support', 'For technical issues and bugs', '2025-01-25 00:58:46.758162+00', '2025-01-25 00:58:46.758162+00');
INSERT INTO public.queues VALUES ('5862bc53-1644-4799-ab58-7674affebb04', 'Customer Service', 'For general customer inquiries', '2025-01-25 00:58:46.762422+00', '2025-01-25 00:58:46.762422+00');
INSERT INTO public.queues VALUES ('6094c48c-b883-497d-b1a8-bf037e887bac', 'Billing', 'For billing and payment issues', '2025-01-25 00:58:46.765128+00', '2025-01-25 00:58:46.765128+00');


--
-- Data for Name: queue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ticket_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

COMMIT;
