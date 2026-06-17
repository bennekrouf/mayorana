'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';

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
            <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p>
                  Mayorana («&nbsp;nous&nbsp;», «&nbsp;notre&nbsp;» ou «&nbsp;nos&nbsp;») respecte votre vie privée et s&apos;engage à protéger vos
                  données personnelles. La présente politique de confidentialité explique comment nous collectons, utilisons et
                  protégeons vos informations lorsque vous visitez notre site mayorana.ch (le «&nbsp;Service&nbsp;»).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Informations que nous collectons</h2>

                <h3 className="text-xl font-medium mb-3">Informations que vous nous fournissez</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Coordonnées (nom, adresse e-mail, nom de l&apos;entreprise)</li>
                  <li>Messages et communications envoyés via nos formulaires de contact</li>
                  <li>Préférences de service et demandes</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Informations collectées automatiquement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Données d&apos;utilisation et statistiques (via Plausible Analytics — respectueux de la vie privée, sans données personnelles)</li>
                  <li>Type et version du navigateur</li>
                  <li>Informations sur l&apos;appareil et adresse IP (anonymisées)</li>
                  <li>Pages visitées et temps passé sur le site</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Comment nous utilisons vos informations</h2>
                <p className="mb-4">Nous utilisons les informations collectées pour&nbsp;:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Répondre à vos demandes et fournir un support client</li>
                  <li>Améliorer notre site et nos services</li>
                  <li>Vous envoyer des informations sur nos services (uniquement avec votre accord)</li>
                  <li>Analyser l&apos;utilisation du site afin d&apos;améliorer l&apos;expérience utilisateur</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Partage et divulgation des données</h2>
                <p className="mb-4">
                  Nous ne vendons, n&apos;échangeons ni ne louons vos informations personnelles. Nous ne pouvons les partager
                  que dans les circonstances limitées suivantes&nbsp;:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Avec votre consentement explicite</li>
                  <li>Pour répondre à des obligations légales ou des décisions de justice</li>
                  <li>Pour protéger nos droits, notre propriété ou notre sécurité</li>
                  <li>Avec des prestataires de confiance qui nous assistent dans l&apos;exploitation du site (sous accords stricts de confidentialité)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Sécurité des données</h2>
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
                  personnelles contre tout accès non autorisé, altération, divulgation ou destruction. Toutefois, aucune méthode
                  de transmission sur Internet n&apos;est totalement sûre.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Vos droits (RGPD)</h2>
                <p className="mb-4">Si vous résidez dans l&apos;Espace économique européen, vous disposez des droits suivants&nbsp;:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Droit d&apos;accès à vos données personnelles</li>
                  <li>Droit de rectification des données inexactes</li>
                  <li>Droit à l&apos;effacement («&nbsp;droit à l&apos;oubli&nbsp;»)</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d&apos;opposition au traitement</li>
                  <li>Droit de retirer votre consentement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookies et traçage</h2>
                <p className="mb-4">Nous utilisons un minimum de technologies de suivi&nbsp;:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Plausible Analytics&nbsp;: analyse respectueuse de la vie privée, sans cookies ni données personnelles</li>
                  <li>Cookies essentiels au fonctionnement du site</li>
                  <li>Préférences de thème (clair / sombre)</li>
                </ul>
                <p>Nous n&apos;utilisons ni cookies publicitaires, ni systèmes de traçage tiers.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Conservation des données</h2>
                <p>
                  Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités décrites dans la présente
                  politique, au respect de nos obligations légales ou à la résolution de litiges. Les messages reçus via le
                  formulaire de contact sont en général conservés pendant 2 ans, sauf demande de suppression anticipée.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Services tiers</h2>
                <p className="mb-4">Notre site peut contenir des liens vers des services tiers&nbsp;:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>api0.ai (notre propre service)</li>
                  <li>Plateformes de réseaux sociaux (LinkedIn, GitHub)</li>
                  <li>WhatsApp (pour nous contacter)</li>
                </ul>
                <p>Ces services disposent de leurs propres politiques de confidentialité, dont nous ne sommes pas responsables.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Transferts internationaux</h2>
                <p>
                  Étant basés en Suisse, vos données sont principalement traitées en Suisse et dans l&apos;Espace économique européen.
                  Tout transfert international est conforme aux lois applicables en matière de protection des données et à des
                  garanties appropriées.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Modifications de la politique</h2>
                <p>
                  Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Toute modification importante
                  sera signalée en publiant la nouvelle version sur cette page, accompagnée d&apos;une date de mise à jour.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Nous contacter</h2>
                <p className="mb-4">
                  Pour toute question concernant cette politique ou nos pratiques en matière de données, contactez-nous&nbsp;:
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
