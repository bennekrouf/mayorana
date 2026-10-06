'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';

const link = 'text-primary hover:underline';

export default function PrivacyFr() {
  return (
    <LayoutTemplate>
      <div className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Politique de confidentialité</h1>
            <p className="text-muted-foreground mb-8">Dernière mise à jour : 6 octobre 2026</p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p>
                  Mayorana («&nbsp;nous&nbsp;») est une entreprise suisse de logiciels. Cette politique explique quelles
                  données personnelles nous collectons lorsque vous utilisez le site mayorana.ch et les outils de bureau qui
                  y sont téléchargés, pourquoi nous les collectons, et ce que vous pouvez nous demander d&apos;en faire.
                </p>
                <p className="mt-4">
                  api0, notre passerelle MCP, est couverte par sa propre{' '}
                  <a href="https://api0.ai/privacy" target="_blank" rel="noopener noreferrer" className={link}>
                    politique de confidentialité
                  </a>
                  , et non par celle-ci.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Les informations que vous nous donnez</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Formulaires de contact et des utilisateurs fondateurs&nbsp;:</strong> votre nom, votre adresse
                    e-mail, votre entreprise (facultatif), le sujet choisi et votre message.
                  </li>
                  <li>
                    <strong>Connexion facultative</strong> avec Google ou GitHub&nbsp;: votre adresse e-mail, votre nom et
                    l&apos;identifiant de votre compte, tels que fournis par ce service. La connexion n&apos;est jamais requise pour
                    télécharger un outil.
                  </li>
                  <li>
                    <strong>Achats</strong> d&apos;une édition payante&nbsp;: votre adresse e-mail et la licence qui vous est
                    délivrée. Les données de carte sont saisies sur la page de paiement de Stripe et ne nous parviennent
                    jamais.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Les informations collectées automatiquement</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Statistiques du site</strong> via Plausible Analytics, qui n&apos;utilise pas de cookies et ne
                    collecte pas de données personnelles. Nous voyons des chiffres agrégés comme les pages vues et les sites
                    d&apos;origine.
                  </li>
                  <li>
                    <strong>Journaux du serveur.</strong> Comme tout serveur web, le nôtre enregistre chaque requête&nbsp;:
                    adresse IP, heure, page ou fichier demandé, navigateur (user agent) et page d&apos;origine. Ces journaux
                    sont supprimés après environ deux semaines. Avant cela, une tâche nocturne les transforme en totaux
                    quotidiens (téléchargements par outil, sites d&apos;origine, pays)&nbsp;; ces totaux ne contiennent aucune
                    adresse IP.
                  </li>
                  <li>
                    <strong>D&apos;où vous venez.</strong> Lors de votre première visite, le site enregistre dans votre
                    navigateur le site ou la campagne qui vous a amené (par exemple une balise utm_source). Cette information
                    est ajoutée aux liens de téléchargement, afin qu&apos;un téléchargement soit attribué au canal qui vous a
                    fait connaître le site. Elle ne contient rien sur vous.
                  </li>
                  <li>
                    <strong>Lorsque vous êtes connecté</strong>, nous enregistrons quels outils vous avez téléchargés, pour
                    quel système d&apos;exploitation et quand, et nous conservons une sauvegarde de votre progression de lecture
                    sur le blog.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Les outils de bureau</h2>
                <p className="mb-4">
                  Certains outils de bureau peuvent envoyer des statistiques d&apos;utilisation, mais seulement si vous
                  l&apos;acceptez dans l&apos;application. Chaque envoi contient un identifiant d&apos;installation aléatoire créé
                  sur votre machine, le nom et la version de l&apos;application, votre système d&apos;exploitation, ainsi que les
                  fonctionnalités utilisées et leur résultat (pour GitAgent, également le type d&apos;hébergeur Git et le
                  fournisseur d&apos;IA choisis). Ces envois nous parviennent sous forme de requêtes vers mayorana.ch&nbsp;: ils
                  figurent donc dans les journaux du serveur décrits ci-dessus, supprimés après environ deux semaines. Nous
                  ne conservons que des totaux quotidiens, jamais de chiffres par installation.
                </p>
                <p>
                  Le skill Claude de chaque outil peut rédiger un rapport de bug pour vous. Vous le relisez et l&apos;envoyez
                  vous-même&nbsp;; rien n&apos;est envoyé automatiquement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Utilisation de vos informations</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Répondre à vos messages et vous assister</li>
                  <li>Délivrer les licences que vous achetez</li>
                  <li>Contacter les utilisateurs fondateurs au sujet des outils qu&apos;ils utilisent, comme indiqué lors de la connexion</li>
                  <li>Vous envoyer des informations sur nos produits, uniquement si vous y consentez</li>
                  <li>Comprendre quels outils et quelles pages sont utilisés, pour savoir quoi améliorer</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
                <p className="mt-4">Nous ne vendons, n&apos;échangeons ni ne louons vos données personnelles.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Prestataires</h2>
                <p className="mb-4">
                  Nous faisons appel aux prestataires suivants, qui traitent chacun les données selon leur propre politique
                  de confidentialité&nbsp;:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Google Firebase Authentication, ainsi que Google ou GitHub, pour la connexion</li>
                  <li>Stripe, pour les paiements</li>
                  <li>Plausible Analytics, pour les statistiques du site</li>
                </ul>
                <p className="mt-4">
                  Les formulaires, les données de connexion et les licences sont traités par la passerelle api0
                  (gateway.api0.ai), que nous exploitons. Nous pouvons aussi communiquer des données lorsque la loi
                  l&apos;exige, ou pour protéger nos droits ou notre sécurité.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookies et stockage dans le navigateur</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Votre thème clair ou sombre</li>
                  <li>Votre progression de lecture sur le blog</li>
                  <li>Le canal qui vous a amené sur le site la première fois (voir ci-dessus)</li>
                  <li>Votre session de connexion, si vous vous connectez</li>
                </ul>
                <p className="mt-4">Nous n&apos;utilisons ni cookies publicitaires ni suivi par des tiers.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Conservation des données</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Messages des formulaires&nbsp;: en général 2 ans, sauf demande de suppression anticipée</li>
                  <li>Données de compte (téléchargements, progression de lecture)&nbsp;: tant que vous conservez votre compte, ou jusqu&apos;à ce que vous en demandiez la suppression</li>
                  <li>Journaux du serveur&nbsp;: environ deux semaines</li>
                  <li>Données d&apos;achat&nbsp;: aussi longtemps que la loi nous impose de les conserver</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Sécurité des données</h2>
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
                  personnelles contre tout accès, modification, divulgation ou destruction non autorisés. Toutefois, aucune
                  méthode de transmission sur Internet n&apos;est sûre à 100&nbsp;%.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Vos droits</h2>
                <p className="mb-4">
                  En vertu de la loi fédérale suisse sur la protection des données et, lorsqu&apos;il s&apos;applique, du règlement
                  général sur la protection des données de l&apos;UE, vous avez le droit de&nbsp;:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Accéder à vos données personnelles</li>
                  <li>Faire corriger des données inexactes</li>
                  <li>Faire supprimer vos données</li>
                  <li>Limiter le traitement ou vous y opposer</li>
                  <li>Recevoir vos données dans un format portable</li>
                  <li>Retirer votre consentement à tout moment</li>
                </ul>
                <p className="mt-4">Pour exercer ces droits, écrivez à contact@mayorana.ch.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Transferts internationaux</h2>
                <p>
                  Nous sommes basés en Suisse. Certains des prestataires ci-dessus, comme Google, GitHub et Stripe, peuvent
                  traiter des données hors de Suisse, y compris aux États-Unis. Ces transferts reposent sur les garanties que
                  ces prestataires offrent au titre du droit applicable en matière de protection des données.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Liens vers des tiers</h2>
                <p>
                  Le site renvoie vers des services comme GitHub, LinkedIn et WhatsApp. Ils ont leur propre politique de
                  confidentialité, et nous ne sommes pas responsables de leurs pratiques.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Modifications de cette politique</h2>
                <p>
                  Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de
                  toute modification importante en publiant la nouvelle politique sur cette page avec une date de révision
                  mise à jour.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Nous contacter</h2>
                <p className="mb-4">
                  Pour toute question sur cette politique de confidentialité ou sur nos pratiques en matière de données,
                  contactez-nous&nbsp;:
                </p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p><strong>E-mail&nbsp;:</strong> contact@mayorana.ch</p>
                  <p><strong>Adresse&nbsp;:</strong> Mayorana, Suisse</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutTemplate>
  );
}
